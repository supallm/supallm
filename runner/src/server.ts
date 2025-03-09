import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import { WorkflowExecutor } from "./executor/workflow-executor";
import { logger } from "./utils/logger";
import {
  ExecuteWorkflowRequest,
  ExecutionEvent,
  StopWorkflowRequest,
  StopWorkflowResponse,
} from "./gen/runner/v1/runner_pb";

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
  [method: string]: any;

  constructor(private port: number = 50051) {
    this.server = new grpc.Server();
    this.workflowExecutor = new WorkflowExecutor();

    this.server.addService(WorkflowRunnerService.service, {
      executeWorkflow: this.executeWorkflow.bind(this),
      stopWorkflow: this.stopWorkflow.bind(this),
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

    try {
      this.setupEventListeners(call);

      this.workflowExecutor
        .execute(workflowId, definition, { inputs })
        .catch((error) => this.handleExecutionError(error, workflowId, call));
    } catch (error) {
      this.handleParsingError(error, workflowId, call);
    }
  }

  /**
   * Stop a workflow execution
   */
  stopWorkflow(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): void {
    const request = new StopWorkflowRequest({
      workflowId: call.request.workflow_id,
    });

    const workflowId = request.workflowId;

    // TODO: Implement workflow stopping logic

    const response = new StopWorkflowResponse({
      success: true,
      message: `Workflow ${workflowId} stopped`,
    });

    callback(null, response);
  }

  /**
   * Converts the raw request into an ExecuteWorkflowRequest object
   */
  private parseExecuteWorkflowRequest(rawRequest: any): ExecuteWorkflowRequest {
    console.log("Raw request:", rawRequest);

    return new ExecuteWorkflowRequest({
      workflowId: rawRequest.workflow_id,
      computedDefinitionJson: rawRequest.computed_definition_json,
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

    let definition = JSON.parse(request.computedDefinitionJson) || {};
    let inputs = JSON.parse(request.inputsJson) || {};

    return { workflowId, definition, inputs };
  }

  private setupEventListeners(call: grpc.ServerWritableStream<any, any>): void {
    // Event: workflow started
    this.workflowExecutor.on("workflowStarted", (data) => {
      call.write(
        this.createEvent("STARTED", {
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
          workflowId: data.workflowId,
          nodeId: "",
          message: `Workflow execution failed: ${data.error}`,
          data: data.error,
        })
      );

      call.end();
    });
  }

  /**
   * Create an ExecutionEvent object
   */
  private createEvent(
    type: string,
    params: {
      workflowId: string;
      nodeId: string;
      message: string;
      data?: any;
    }
  ): ExecutionEvent {
    // Convertir les données en chaîne JSON
    const dataJson = params.data ? JSON.stringify(params.data) : undefined;

    return new ExecutionEvent({
      type,
      workflowId: params.workflowId,
      nodeId: params.nodeId,
      message: params.message,
      dataJson: dataJson,
      timestamp: Date.now().toString(),
    });
  }

  /**
   * Handle workflow execution errors
   */
  private handleExecutionError(
    error: any,
    workflowId: string,
    call: grpc.ServerWritableStream<any, any>
  ): void {
    logger.error(`Error executing workflow ${workflowId}: ${error}`);

    call.write(
      this.createEvent("FAILED", {
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
    call: grpc.ServerWritableStream<any, any>
  ): void {
    logger.error(`Error parsing workflow definition: ${error}`);

    call.write(
      this.createEvent("FAILED", {
        workflowId,
        nodeId: "",
        message: `Error parsing workflow definition: ${error}`,
        data: error,
      })
    );

    call.end();
  }
}
