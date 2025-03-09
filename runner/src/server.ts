import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import { WorkflowExecutor } from "./executor/workflow-executor";
import { logger } from "./utils/logger";
import {
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
const WorkflowRunnerService = runnerProto.WorkflowRunner;

export class RunnerServer {
  private server: grpc.Server;
  private workflowExecutor: WorkflowExecutor;
  private reflection: grpcReflection.ReflectionService;
  private CHUNK_THRESHOLD = 10;
  private chunkBuffer = "";
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
    this.server.addService(WorkflowRunnerService.service, {
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
      this.handleParsingError(error, workflowId, sessionId, call);
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
        this.createEvent("STARTED", {
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
        this.createEvent("NODE_STARTED", {
          sessionId: data.sessionId,
          workflowId: data.workflowId,
          nodeId: data.nodeId,
          data: data.inputs,
          message: `Node ${data.nodeId} execution started`,
        })
      );
    });

    // Event: node completed
    this.workflowExecutor.on("nodeCompleted", (data) => {
      call.write(
        this.createEvent("NODE_COMPLETED", {
          sessionId: data.sessionId,
          workflowId: data.workflowId,
          nodeId: data.nodeId,
          message: `Node ${data.nodeId} execution completed`,
          data: data.output,
        })
      );
    });

    // Event: node failed
    this.workflowExecutor.on("nodeFailed", (data) => {
      call.write(
        this.createEvent("NODE_FAILED", {
          sessionId: data.sessionId,
          workflowId: data.workflowId,
          nodeId: data.nodeId,
          message: `Node ${data.nodeId} execution failed: ${data.error}`,
          data: data.error,
        })
      );
    });

    // Event: workflow completed
    this.workflowExecutor.on("workflowCompleted", (data) => {
      call.write(
        this.createEvent("COMPLETED", {
          sessionId: data.sessionId,
          workflowId: data.workflowId,
          nodeId: data.nodeId,
          message: "Workflow execution completed",
          data: data.output,
        })
      );

      call.end();
    });

    // Event: workflow failed
    this.workflowExecutor.on("workflowFailed", (data) => {
      call.write(
        this.createEvent("FAILED", {
          sessionId: data.sessionId,
          workflowId: data.workflowId,
          nodeId: "",
          message: `Workflow execution failed: ${data.error}`,
          data: data.error,
        })
      );

      call.end();
    });

    this.workflowExecutor.on("nodeStreaming", (data) => {
      call.write({
        type: "NODE_STREAMING",
        workflow_id: data.workflowId || "",
        session_id: data.sessionId || "",
        node_id: data.nodeId || "",
        message: "Streaming chunk received",
        data_json: data.chunk,
        timestamp: Date.now().toString(),
      });
    });

    // Event: node end streaming
    this.workflowExecutor.on("nodeEndStreaming", (data) => {
      const rawEvent = {
        type: "NODE_END_STREAMING",
        workflow_id: data.workflowId || "",
        session_id: data.sessionId || "",
        node_id: data.nodeId || "",
        message: "Streaming chunk received",
        data_json: data.fullText,
        timestamp: Date.now().toString(),
      };

      call.write(rawEvent);
      logger.info(`Streaming complete for node ${data.nodeId}`);
    });
  }

  /**
   * Create an ExecutionEvent object
   */
  private createEvent(
    type: string,
    params: {
      sessionId: string;
      workflowId: string;
      nodeId: string;
      message: string;
      data?: any;
    }
  ): ExecutionEvent {
    // Créer l'événement
    const event = new ExecutionEvent({
      type,
      sessionId: params.sessionId || "",
      workflowId: params.workflowId || "",
      nodeId: params.nodeId || "",
      message: params.message,
      dataJson: params.data !== undefined ? JSON.stringify(params.data) : "",
      timestamp: Date.now().toString(),
    });

    // Déboguer l'événement créé
    logger.debug(
      `Created event object: ${JSON.stringify({
        type: event.type,
        workflowId: event.workflowId,
        sessionId: event.sessionId,
        nodeId: event.nodeId,
        message: event.message,
        dataJsonLength: event.dataJson ? event.dataJson.length : 0,
        timestamp: event.timestamp,
      })}`
    );

    return event;
  }

  /**
   * Handle workflow execution errors
   */
  private handleExecutionError(
    error: any,
    workflowId: string,
    sessionId: string,
    call: grpc.ServerWritableStream<any, any>
  ): void {
    logger.error(`Error executing workflow ${workflowId}: ${error}`);

    call.write(
      this.createEvent("FAILED", {
        sessionId,
        workflowId,
        nodeId: "",
        message: `Unexpected error: ${error.message}`,
        data: error,
      })
    );

    call.end();
  }

  /**
   * Handle workflow parsing errors
   */
  private handleParsingError(
    error: any,
    workflowId: string,
    sessionId: string,
    call: grpc.ServerWritableStream<any, any>
  ): void {
    logger.error(`Error parsing workflow definition: ${error}`);

    call.write(
      this.createEvent("FAILED", {
        sessionId,
        workflowId,
        nodeId: "",
        message: `Error parsing workflow definition: ${error}`,
        data: error,
      })
    );

    call.end();
  }
}
