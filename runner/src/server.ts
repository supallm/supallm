import { WorkflowExecutor } from "./services/workflow/workflow.executor";
import { RedisNotifier, INotifier, WorkflowEvents } from "./services/notifier";
import { RedisQueueConsumer, IQueueConsumer, WorkflowMessage } from "./services/queue";
import { NodeManager } from "./services/node/node-manager";
import { logger } from "./utils/logger";

interface RunnerConfig {
  maxParallelJobs?: number;
  redisUrl: string;
}

export class RunnerServer {
  private readonly queueConsumer: IQueueConsumer;
  private readonly notifier: INotifier;
  private readonly nodeManager: NodeManager;
  private readonly executor: WorkflowExecutor;

  constructor(config: RunnerConfig) {
    this.queueConsumer = new RedisQueueConsumer(config.redisUrl, {
      maxParallelJobs: config.maxParallelJobs ?? 10,
    });
    this.notifier = new RedisNotifier(config.redisUrl);
    this.nodeManager = new NodeManager();
    this.executor = new WorkflowExecutor(this.nodeManager);

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

  private async handleWorkflowExecution(
    message: WorkflowMessage
  ): Promise<void> {
    const { workflow_id, trigger_id, session_id, project_id, definition, inputs } = message;

    try {
      this.executor.execute(workflow_id, definition, {
        inputs,
        projectId: project_id,
        sessionId: session_id,
        triggerId: trigger_id,
      });
    } catch (error) {
      logger.error(`error executing workflow ${workflow_id}: ${error}`);
    }
  }

  private setupEventListeners(): void {
    this.executor.on(
      WorkflowEvents.WORKFLOW_STARTED,
      this.handleWorkflowStarted.bind(this)
    );
    this.executor.on(
      WorkflowEvents.WORKFLOW_COMPLETED,
      this.handleWorkflowCompleted.bind(this)
    );
    this.executor.on(
      WorkflowEvents.WORKFLOW_FAILED,
      this.handleWorkflowFailed.bind(this)
    );
    this.executor.on(
      WorkflowEvents.NODE_STARTED,
      this.handleNodeStarted.bind(this)
    );
    this.executor.on(
      WorkflowEvents.NODE_COMPLETED,
      this.handleNodeCompleted.bind(this)
    );
    this.executor.on(
      WorkflowEvents.NODE_FAILED,
      this.handleNodeFailed.bind(this)
    );
    this.executor.on(
      WorkflowEvents.NODE_RESULT,
      this.handleNodeResult.bind(this)
    );
  }

  private async handleWorkflowStarted(data: any): Promise<void> {
    await this.notifier.publishWorkflowEvent({
      type: WorkflowEvents.WORKFLOW_STARTED,
      workflowId: data.workflowId,
      triggerId: data.triggerId,
      sessionId: data.sessionId,
      data: { inputs: data.inputs },
    });
  }

  private async handleWorkflowCompleted(data: any): Promise<void> {
    await this.notifier.publishWorkflowEvent({
      type: WorkflowEvents.WORKFLOW_COMPLETED,
      workflowId: data.workflowId,
      triggerId: data.triggerId,
      sessionId: data.sessionId,
      data: { result: data.result },
    });
  }

  private async handleWorkflowFailed(data: any): Promise<void> {
    await this.notifier.publishWorkflowEvent({
      type: WorkflowEvents.WORKFLOW_FAILED,
      workflowId: data.workflowId,
      triggerId: data.triggerId,
      sessionId: data.sessionId,
      data: { error: data.error },
    });
  }

  private async handleNodeStarted(data: any): Promise<void> {
    await this.notifier.publishWorkflowEvent({
      type: WorkflowEvents.NODE_STARTED,
      workflowId: data.workflowId,
      triggerId: data.triggerId,
      sessionId: data.sessionId,
      data: {
        nodeId: data.nodeId,
        type: data.nodeType,
        inputs: data.inputs,
      },
    });
  }

  private async handleNodeCompleted(data: any): Promise<void> {
    await this.notifier.publishWorkflowEvent({
      type: WorkflowEvents.NODE_COMPLETED,
      workflowId: data.workflowId,
      triggerId: data.triggerId,
      sessionId: data.sessionId,
      data: {
        nodeId: data.nodeId,
        nodeType: data.nodeType,
        output: data.output,
      },
    });
  }

  private async handleNodeFailed(data: any): Promise<void> {
    await this.notifier.publishWorkflowEvent({
      type: WorkflowEvents.NODE_FAILED,
      workflowId: data.workflowId,
      triggerId: data.triggerId,
      sessionId: data.sessionId,
      data: {
        nodeId: data.nodeId,
        nodeType: data.nodeType,
        error: data.error,
      },
    });
  }

  private async handleNodeResult(data: any): Promise<void> {
    await this.notifier.publishNodeResult({
      type: WorkflowEvents.NODE_RESULT,
      workflowId: data.workflowId,
      triggerId: data.triggerId,
      sessionId: data.sessionId,
      data: {
        nodeId: data.nodeId,
        nodeType: data.nodeType,
        outputField: data.outputField,
        data: data.data,
        type: data.type,
      },
    });
  }
}
