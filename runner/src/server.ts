import { WorkflowExecutor } from "./executor/workflow-executor";
import { RedisNotifier, INotifier, NotifierEvent } from "./services/notifier";
import { RedisQueueConsumer, IQueueConsumer } from "./services/queue";
import { logger } from "./utils/logger";
import { v4 as uuidv4 } from "uuid";

export class RunnerServer {
  private queueConsumer: IQueueConsumer;
  private notifier: INotifier;
  private executor: WorkflowExecutor;

  constructor(redisUrl: string) {
    this.queueConsumer = new RedisQueueConsumer(redisUrl);
    this.notifier = new RedisNotifier(redisUrl);
    this.executor = new WorkflowExecutor();
  }

  async start(): Promise<void> {
    try {
      await this.queueConsumer.initialize();
      await this.notifier.initialize();

      logger.info("Runner server started, consuming from workflow queue");

      this.queueConsumer.consumeWorkflowQueue(
        this.handleWorkflowExecution.bind(this)
      );
    } catch (error) {
      logger.error(`Failed to start runner server: ${error}`);
      throw error;
    }
  }

  async stop(): Promise<void> {
    await this.queueConsumer.close();
    await this.notifier.close();
    logger.info("Runner server stopped");
  }

  private async handleWorkflowExecution(message: {
    workflow_id: string;
    trigger_id: string;
    project_id: string;
    definition: any;
    inputs: Record<string, any>;
  }): Promise<void> {
    const { workflow_id, trigger_id, definition, inputs } = message;
    const sessionId = uuidv4();

    try {
      // Publish workflow started event
      await this.notifier.publishEvent({
        type: NotifierEvent.WORKFLOW_STARTED,
        workflowId: workflow_id,
        triggerId: trigger_id,
        sessionId,
        data: { inputs },
      });

      // Execute workflow
      const result = await this.executor.execute(workflow_id, definition, {
        inputs,
        sessionId,
        callbacks: {
          onNodeStart: async (nodeId: string, nodeType: string) => {
            await this.notifier.publishEvent({
              type: NotifierEvent.NODE_STARTED,
              workflowId: workflow_id,
              triggerId: trigger_id,
              sessionId,
              nodeId,
              data: { type: nodeType },
            });
          },
          onNodeStream: async (
            nodeId: string,
            outputField: string,
            chunk: string
          ) => {
            await this.notifier.publishEvent({
              type: NotifierEvent.NODE_STREAMING,
              workflowId: workflow_id,
              triggerId: trigger_id,
              sessionId,
              nodeId,
              data: { chunk, outputField },
            });
          },
          onNodeComplete: async (nodeId: string, output: any) => {
            await this.notifier.publishEvent({
              type: NotifierEvent.NODE_COMPLETED,
              workflowId: workflow_id,
              triggerId: trigger_id,
              sessionId,
              nodeId,
              data: { output },
            });
          },
          onNodeError: async (nodeId: string, error: Error) => {
            await this.notifier.publishEvent({
              type: NotifierEvent.NODE_FAILED,
              workflowId: workflow_id,
              triggerId: trigger_id,
              sessionId,
              nodeId,
              data: { error: error.message },
            });
          },
        },
      });

      // Publish workflow completed event
      await this.notifier.publishEvent({
        type: NotifierEvent.WORKFLOW_COMPLETED,
        workflowId: workflow_id,
        triggerId: trigger_id,
        sessionId,
        data: { result: result.output },
      });
    } catch (error) {
      logger.error(`Error executing workflow ${workflow_id}: ${error}`);

      // Publish workflow failed event
      await this.notifier.publishEvent({
        type: NotifierEvent.WORKFLOW_FAILED,
        workflowId: workflow_id,
        triggerId: trigger_id,
        sessionId,
        data: { error: error instanceof Error ? error.message : String(error) },
      });
    }
  }
}
