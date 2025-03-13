import { WorkflowExecutor, WorkflowEvents } from "./executor/workflow-executor";
import { RedisNotifier, INotifier, NotifierEvent } from "./services/notifier";
import { RedisQueueConsumer, IQueueConsumer } from "./services/queue";
import { logger } from "./utils/logger";

export class RunnerServer {
  private queueConsumer: IQueueConsumer;
  private notifier: INotifier;
  private executor: WorkflowExecutor;

  constructor(redisUrl: string) {
    this.queueConsumer = new RedisQueueConsumer(redisUrl);
    this.notifier = new RedisNotifier(redisUrl);
    this.executor = new WorkflowExecutor();

    this.setupEventListeners();
  }

  async start(): Promise<void> {
    try {
      await this.queueConsumer.initialize();
      await this.notifier.initialize();

      logger.info("runner server started, consuming from workflow queue");

      this.queueConsumer.consumeWorkflowQueue(
        this.handleWorkflowExecution.bind(this)
      );
    } catch (error) {
      logger.error(`failed to start runner server: ${error}`);
      throw error;
    }
  }

  async stop(): Promise<void> {
    await this.queueConsumer.close();
    await this.notifier.close();
    logger.info("runner server stopped");
  }

  private async handleWorkflowExecution(message: {
    workflow_id: string;
    trigger_id: string;
    session_id: string;
    project_id: string;
    definition: any;
    inputs: Record<string, any>;
  }): Promise<void> {
    const { workflow_id, trigger_id, session_id, definition, inputs } = message;

    try {
      await this.executor.execute(workflow_id, definition, {
        inputs,
        sessionId: session_id,
        triggerId: trigger_id,
      });
    } catch (error) {
      logger.error(`error executing workflow ${workflow_id}: ${error}`);
    }
  }

  private setupEventListeners(): void {
    this.executor.on(WorkflowEvents.WORKFLOW_STARTED, async (data) => {
      await this.notifier.publishWorkflowEvent({
        type: NotifierEvent.WORKFLOW_STARTED,
        workflowId: data.workflowId,
        triggerId: data.triggerId,
        sessionId: data.sessionId,
        data: { inputs: data.inputs },
      });
    });

    this.executor.on(WorkflowEvents.WORKFLOW_COMPLETED, async (data) => {
      await this.notifier.publishWorkflowEvent({
        type: NotifierEvent.WORKFLOW_COMPLETED,
        workflowId: data.workflowId,
        triggerId: data.triggerId,
        sessionId: data.sessionId,
        data: { result: data.result },
      });
    });

    this.executor.on(WorkflowEvents.WORKFLOW_FAILED, async (data) => {
      await this.notifier.publishWorkflowEvent({
        type: NotifierEvent.WORKFLOW_FAILED,
        workflowId: data.workflowId,
        triggerId: data.triggerId,
        sessionId: data.sessionId,
        data: { error: data.error },
      });
    });

    this.executor.on(WorkflowEvents.NODE_STARTED, async (data) => {
      await this.notifier.publishWorkflowEvent({
        type: NotifierEvent.NODE_STARTED,
        workflowId: data.workflowId,
        triggerId: data.triggerId,
        sessionId: data.sessionId,
        data: {
          nodeId: data.nodeId,
          type: data.nodeType,
          inputs: data.inputs,
        },
      });
    });

    this.executor.on(WorkflowEvents.NODE_COMPLETED, async (data) => {
      await this.notifier.publishWorkflowEvent({
        type: NotifierEvent.NODE_COMPLETED,
        workflowId: data.workflowId,
        triggerId: data.triggerId,
        sessionId: data.sessionId,
        data: {
          nodeId: data.nodeId,
          nodeType: data.nodeType,
          output: data.output,
        },
      });
    });

    this.executor.on(WorkflowEvents.NODE_FAILED, async (data) => {
      await this.notifier.publishWorkflowEvent({
        type: NotifierEvent.NODE_FAILED,
        workflowId: data.workflowId,
        triggerId: data.triggerId,
        sessionId: data.sessionId,
        data: {
          nodeId: data.nodeId,
          nodeType: data.nodeType,
          error: data.error,
        },
      });
    });

    this.executor.on(WorkflowEvents.NODE_RESULT, async (data) => {
      await this.notifier.publishNodeResult({
        type: NotifierEvent.NODE_RESULT,
        workflowId: data.workflowId,
        triggerId: data.triggerId,
        sessionId: data.sessionId,
        data: {
          nodeId: data.nodeId,
          nodeType: data.nodeType,
          outputField: data.outputField,
          data: data.data,
        },
      });
    });
  }
}
