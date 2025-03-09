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
// @ts-ignore - Ignorer l'erreur de type
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

  stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.tryShutdown(() => {
        logger.info("gRPC server stopped");
        resolve();
      });
    });
  }

  executeWorkflow(call: grpc.ServerWritableStream<any, any>): void {
    const rawRequest = call.request;
    const request = new ExecuteWorkflowRequest({
      workflowId: rawRequest.workflow_id,
      computedDefinition: rawRequest.computed_definition,
      inputs: rawRequest.inputs,
    });

    const workflowId = request.workflowId;
    const computedDefinitionBuffer = request.computedDefinition;
    const inputsBuffer = request.inputs;

    try {
      const definition = JSON.parse(
        new TextDecoder().decode(computedDefinitionBuffer)
      );
      const inputs =
        inputsBuffer.length > 0
          ? JSON.parse(new TextDecoder().decode(inputsBuffer))
          : {};

      // Set up event listeners to stream back events
      this.workflowExecutor.on("workflowStarted", (data) => {
        const event = new ExecutionEvent({
          type: "STARTED",
          workflowId: data.workflowId,
          message: "Workflow execution started",
          data: Buffer.from(JSON.stringify(data.inputs)),
          nodeId: data.nodeId,
          timestamp: BigInt(Date.now()),
        });
        call.write(event);
      });

      this.workflowExecutor.on("nodeStarted", (data) => {
        const event = new ExecutionEvent({
          type: "NODE_STARTED",
          workflowId: data.workflowId,
          nodeId: data.nodeId,
          data: Buffer.from(JSON.stringify(data.inputs)),
          message: `Node ${data.nodeId} execution started`,
          timestamp: BigInt(Date.now()),
        });
        call.write(event);
      });

      this.workflowExecutor.on("nodeCompleted", (data) => {
        const event = new ExecutionEvent({
          type: "NODE_COMPLETED",
          workflowId: data.workflowId,
          nodeId: data.nodeId,
          message: `Node ${data.nodeId} execution completed`,
          data: Buffer.from(JSON.stringify(data.output)),
          timestamp: BigInt(Date.now()),
        });
        call.write(event);
      });

      this.workflowExecutor.on("nodeFailed", (data) => {
        const event = new ExecutionEvent({
          type: "NODE_FAILED",
          workflowId: data.workflowId,
          nodeId: data.nodeId,
          message: `Node ${data.nodeId} execution failed: ${data.error}`,
          data: Buffer.from(JSON.stringify(data.error)),
          timestamp: BigInt(Date.now()),
        });
        call.write(event);
      });

      this.workflowExecutor.on("workflowCompleted", (data) => {
        const event = new ExecutionEvent({
          type: "COMPLETED",
          workflowId: data.workflowId,
          nodeId: data.nodeId,
          message: "Workflow execution completed",
          data: Buffer.from(JSON.stringify(data.output)),
          timestamp: BigInt(Date.now()),
        });
        call.write(event);

        // End the stream
        call.end();
      });

      this.workflowExecutor.on("workflowFailed", (data) => {
        const event = new ExecutionEvent({
          type: "FAILED",
          workflowId: data.workflowId,
          nodeId: "",
          message: `Workflow execution failed: ${data.error}`,
          data: Buffer.from(JSON.stringify(data.error)),
          timestamp: BigInt(Date.now()),
        });
        call.write(event);

        // End the stream
        call.end();
      });

      // Execute the workflow
      this.workflowExecutor
        .execute(workflowId, definition, { inputs })
        .catch((error) => {
          logger.error(`Error executing workflow ${workflowId}: ${error}`);

          // If there was an error that wasn't caught by the executor
          const event = new ExecutionEvent({
            type: "FAILED",
            workflowId,
            nodeId: "",
            data: Buffer.from(JSON.stringify(error)),
            message: `Unexpected error: ${error.message}`,
            timestamp: BigInt(Date.now()),
          });
          call.write(event);

          call.end();
        });
    } catch (error) {
      logger.error(`Error parsing workflow definition: ${error}`);

      const event = new ExecutionEvent({
        type: "FAILED",
        workflowId,
        nodeId: "",
        data: Buffer.from(JSON.stringify(error)),
        message: `Error parsing workflow definition: ${error}`,
        timestamp: BigInt(Date.now()),
      });
      call.write(event);

      call.end();
    }
  }

  stopWorkflow(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): void {
    const rawRequest = call.request;
    const request = new StopWorkflowRequest({
      workflowId: rawRequest.workflow_id,
    });

    const workflowId = request.workflowId;

    // TODO: Implement workflow stopping logic

    const response = new StopWorkflowResponse({
      success: true,
      message: `Workflow ${workflowId} stopped`,
    });

    callback(null, response);
  }
}
