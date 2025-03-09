import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import { WorkflowExecutor } from "./executor/workflow-executor";
import { logger } from "./utils/logger";
import {
  EventType,
  ExecuteWorkflowRequest,
  ExecutionEvent,
  ValidateWorkflowRequest,
  ValidateWorkflowResponse,
} from "./gen/runner/v1/runner_pb";
import * as grpcReflection from "@grpc/reflection";

// Load the gRPC service
const PROTO_PATH = path.resolve(
  __dirname,
  "../../proto/runner/v1/runner.proto"
);
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
// @ts-ignore - Ignore type error
const runnerProto = protoDescriptor.runner.v1;
const RunnerService = runnerProto.RunnerService;

export class RunnerServer {
  private server: grpc.Server;
  private workflowExecutor: WorkflowExecutor;
  private reflection: grpcReflection.ReflectionService;
  [method: string]: any;

  constructor(private port: number = 50051) {
    const serverOptions = {
      "grpc.initial_window_size": 1024 * 1024 * 16, // 4 MB
      "grpc.initial_connection_window_size": 1024 * 1024 * 32, // 8 MB
      "grpc.http2.min_time_between_pings_ms": 5000,
      "grpc.http2.max_pings_without_data": 0,
      "grpc.keepalive_time_ms": 5000,
      "grpc.keepalive_timeout_ms": 2000,
      "grpc.max_receive_message_length": 1024 * 1024 * 100,
      "grpc.max_send_message_length": 1024 * 1024 * 100,
    };

    this.server = new grpc.Server(serverOptions);
    this.workflowExecutor = new WorkflowExecutor();
    this.reflection = new grpcReflection.ReflectionService(packageDefinition);

    this.reflection.addToServer(this.server);
    this.server.addService(RunnerService.service, {
      executeWorkflow: this.executeWorkflow.bind(this),
      validateWorkflow: this.validateWorkflow.bind(this),
    });
  }

  /**
   * Start the gRPC server
   */
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.bindAsync(
        `0.0.0.0:${this.port}`,
        grpc.ServerCredentials.createInsecure(),
        (err, port) => {
          if (err) {
            reject(err);
            return;
          }

          logger.info(`gRPC server started on port ${port}`);
          resolve();
        }
      );
    });
  }

  /**
   * Stop the gRPC server
   */
  stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.tryShutdown(() => {
        logger.info("gRPC server stopped");
        resolve();
      });
    });
  }

  /**
   * Execute a workflow and send events to the client
   */
  executeWorkflow(call: grpc.ServerWritableStream<any, any>): void {
    const request = this.parseExecuteWorkflowRequest(call.request);
    const { workflowId, definition, inputs } =
      this.extractWorkflowData(request);
    const sessionId = request.sessionId;

    try {
      this.setupEventListeners(call);

      this.workflowExecutor
        .execute(workflowId, definition, {
          inputs,
          sessionId: sessionId,
        })
        .catch((error) =>
          this.handleExecutionError(error, workflowId, sessionId, call)
        );
    } catch (error) {
      this.handleParsingError(error as Error, workflowId, sessionId, call);
    }
  }

  /**
   * Stop a workflow execution
   */
  validateWorkflow(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): void {
    const request = new ValidateWorkflowRequest({
      workflowId: call.request.workflow_id,
      sessionId: call.request.session_id,
    });

    // TODO: Implement workflow validation logic
    const response = new ValidateWorkflowResponse({
      computedWorkflowJson: JSON.stringify({}),
    });

    callback(null, response);
  }

  /**
   * Converts the raw request into an ExecuteWorkflowRequest object
   */
  private parseExecuteWorkflowRequest(rawRequest: any): ExecuteWorkflowRequest {
    console.log("Raw request:", rawRequest);

    return new ExecuteWorkflowRequest({
      sessionId: rawRequest.session_id,
      workflowId: rawRequest.workflow_id,
      computedWorkflowJson: rawRequest.computed_workflow_json,
      inputsJson: rawRequest.inputs_json,
    });
  }

  /**
   * Extracts workflow data from the request
   */
  private extractWorkflowData(request: ExecuteWorkflowRequest): {
    workflowId: string;
    definition: any;
    inputs: any;
  } {
    const workflowId = request.workflowId;

    let definition = JSON.parse(request.computedWorkflowJson) || {};
    let inputs = JSON.parse(request.inputsJson) || {};

    return { workflowId, definition, inputs };
  }

  private setupEventListeners(call: grpc.ServerWritableStream<any, any>): void {
    // Event: workflow started
    this.workflowExecutor.on("workflowStarted", (data) => {
      call.write(
        this.createEvent(EventType.STARTED, {
          sessionId: data.sessionId,
          workflowId: data.workflowId,
          message: "Workflow execution started",
          data: data.inputs,
          nodeId: data.nodeId,
        })
      );
    });

    // Event: node started
    this.workflowExecutor.on("nodeStarted", (data) => {
      call.write(
        this.createEvent(EventType.NODE_STARTED, {
          sessionId: data.sessionId,
          workflowId: data.workflowId,
          nodeId: data.nodeId,
          data: data.inputs,
          message: "Node started",
        })
      );
    });

    // Event: node completed
    this.workflowExecutor.on("nodeCompleted", (data) => {
      call.write(
        this.createEvent(EventType.NODE_COMPLETED, {
          sessionId: data.sessionId,
          workflowId: data.workflowId,
          nodeId: data.nodeId,
          data: data.output,
          message: "Node completed",
        })
      );
    });

    // Event: workflow completed
    this.workflowExecutor.on("workflowCompleted", (data) => {
      call.write(
        this.createEvent(EventType.COMPLETED, {
          sessionId: data.sessionId,
          workflowId: data.workflowId,
          message: "Workflow completed",
        })
      );

      logger.info(`Workflow completed: ${data.workflowId}`);
      call.end();
    });

    // Event: workflow failed
    this.workflowExecutor.on("workflowFailed", (data) => {
      call.write(
        this.createEvent(EventType.FAILED, {
          sessionId: data.sessionId,
          workflowId: data.workflowId,
          message: "Workflow failed",
        })
      );

      logger.error(`Workflow failed: ${data.workflowId}`);
      call.end();
    });

    // Event: node streaming
    this.workflowExecutor.on("nodeStreaming", (data) => {
      call.write(
        this.createEvent(EventType.NODE_STREAMING, {
          sessionId: data.sessionId,
          workflowId: data.workflowId,
          nodeId: data.nodeId,
          message: "Node streaming",
        })
      );
    });
    // Event: node end streaming
    this.workflowExecutor.on("nodeEndStreaming", (data) => {
      call.write(
        this.createEvent(EventType.NODE_END_STREAMING, {
          sessionId: data.sessionId,
          workflowId: data.workflowId,
          nodeId: data.nodeId,
          message: "Node end streaming",
        })
      );
    });
  }

  private createEvent(
    eventType: EventType,
    data: Record<string, any>
  ): ExecutionEvent {
    return new ExecutionEvent({
      type: eventType,
      sessionId: data.sessionId,
      workflowId: data.workflowId,
      nodeId: data.nodeId,
      dataJson: JSON.stringify(data.data),
      message: data.message,
      timestamp: Date.now().toString(),
    });
  }

  private handleExecutionError(
    error: Error,
    workflowId: string,
    sessionId: string,
    call: grpc.ServerWritableStream<any, any>
  ): void {
    call.write(
      this.createEvent(EventType.FAILED, {
        sessionId,
        workflowId,
        message: error.message,
      })
    );

    logger.error(`Error executing workflow: ${error.message}`);
    call.end();
  }

  private handleParsingError(
    error: Error,
    workflowId: string,
    sessionId: string,
    call: grpc.ServerWritableStream<any, any>
  ): void {
    call.write(
      this.createEvent(EventType.FAILED, {
        sessionId,
        workflowId,
        message: error.message,
      })
    );

    logger.error(`Error parsing workflow: ${error.message}`);
    call.end();
  }
}
