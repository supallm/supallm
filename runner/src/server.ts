import { WorkflowExecutor } from "./executor/workflow-executor";
import { logger } from "./utils/logger";
import {
  RedisService,
  WorkflowQueueMessage,
  WorkflowEventMessage,
} from "./services/redis-service";
import { v4 as uuidv4 } from "uuid";

export class RunnerServer {
  private redisService: RedisService;
  private executor: WorkflowExecutor;
  private isRunning: boolean = false;

  constructor(redisUrl: string) {
    this.redisService = new RedisService(redisUrl);
    this.executor = new WorkflowExecutor();
  }

  async start(): Promise<void> {
    try {
      await this.redisService.initialize();
      this.isRunning = true;

      logger.info("Runner server started, consuming from workflow queue");

      // Start consuming from the workflow queue
      this.redisService.consumeWorkflowQueue(
        this.handleWorkflowExecution.bind(this)
      );
    } catch (error) {
      logger.error(`Failed to start runner server: ${error}`);
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    await this.redisService.close();
    logger.info("Runner server stopped");
  }

  private async handleWorkflowExecution(
    message: WorkflowQueueMessage
  ): Promise<void> {
    const { workflow_id, trigger_id, definition, inputs } = message;
    const sessionId = uuidv4();

    try {
      // Publish workflow started event
      await this.redisService.publishEvent({
        type: this.redisService.EVENT_WORKFLOW_STARTED,
        workflow_id,
        trigger_id,
        session_id: sessionId,
        data: { inputs },
      });

      // Execute the workflow
      const result = await this.executor.execute(workflow_id, definition, {
        inputs,
        sessionId,
        onNodeStart: async (nodeId, nodeType) => {
          await this.redisService.publishEvent({
            type: this.redisService.EVENT_NODE_STARTED,
            workflow_id,
            trigger_id,
            session_id: sessionId,
            node_id: nodeId,
            data: { type: nodeType },
          });
        },
        onNodeStream: async (nodeId, chunk) => {
          await this.redisService.publishEvent({
            type: this.redisService.EVENT_NODE_STREAMING,
            workflow_id,
            trigger_id,
            session_id: sessionId,
            node_id: nodeId,
            data: { chunk },
          });
        },
        onNodeComplete: async (nodeId, output) => {
          await this.redisService.publishEvent({
            type: this.redisService.EVENT_NODE_COMPLETED,
            workflow_id,
            trigger_id,
            session_id: sessionId,
            node_id: nodeId,
            data: { output },
          });
        },
        onNodeError: async (nodeId, error) => {
          await this.redisService.publishEvent({
            type: this.redisService.EVENT_NODE_FAILED,
            workflow_id,
            trigger_id,
            session_id: sessionId,
            node_id: nodeId,
            data: { error: error.message },
          });
        },
      });

      // Publish workflow completed event
      await this.redisService.publishEvent({
        type: this.redisService.EVENT_WORKFLOW_COMPLETED,
        workflow_id,
        trigger_id,
        session_id: sessionId,
        data: { result },
      });
    } catch (error) {
      logger.error(`Error executing workflow ${workflow_id}: ${error}`);

      // Publish workflow failed event
      await this.redisService.publishEvent({
        type: this.redisService.EVENT_WORKFLOW_FAILED,
        workflow_id,
        trigger_id,
        session_id: sessionId,
        data: { error: error instanceof Error ? error.message : String(error) },
      });
    }
  }
}
