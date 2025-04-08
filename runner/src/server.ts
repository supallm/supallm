import { IContextService, RedisContextService } from "./services/context";
import { NodeManager } from "./services/node/node-manager";
import {
  INotifier,
  RedisNotifier,
  WorkflowEvent,
  WorkflowEvents,
  WorkflowEventType,
} from "./services/notifier";
import {
  IQueueConsumer,
  RedisQueueConsumer,
  WorkflowMessage,
} from "./services/queue";
import { WorkflowExecutor } from "./services/workflow/workflow.executor";
import { RunnerConfig } from "./utils/config";
import { logger } from "./utils/logger";

export class RunnerServer {
  private readonly queueConsumer: IQueueConsumer;
  private readonly notifier: INotifier;
  private readonly nodeManager: NodeManager;
  private readonly contextService: IContextService;
  private readonly executor: WorkflowExecutor;

  constructor(config: RunnerConfig) {
    this.queueConsumer = new RedisQueueConsumer(config.redis, {
      maxParallelJobs: config.maxConcurrentJobs,
    });
    this.notifier = new RedisNotifier(config.redis);
    this.nodeManager = new NodeManager();
    this.contextService = new RedisContextService(config.redis);
    this.executor = new WorkflowExecutor(this.nodeManager, this.contextService);

    this.setupEventListeners();
  }

  async start(): Promise<void> {
    try {
      await this.queueConsumer.initialize();
      await this.notifier.initialize();
      logger.info("runner server started");

      this.queueConsumer.consumeWorkflowQueue(
        this.handleWorkflowExecution.bind(this),
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
    message: WorkflowMessage,
  ): Promise<void> {
    const {
      workflow_id,
      trigger_id,
      session_id,
      project_id,
      definition,
      inputs,
    } = message;

    try {
      await this.executor.execute(workflow_id, definition, {
        inputs,
        projectId: project_id,
        sessionId: session_id,
        triggerId: trigger_id,
      });
    } catch (error) {
      logger.error(`Error executing workflow ${workflow_id}: ${error}`);
    }
  }

  private setupEventListeners(): void {
    const allEvents = [
      WorkflowEvents.WORKFLOW_STARTED,
      WorkflowEvents.WORKFLOW_COMPLETED,
      WorkflowEvents.WORKFLOW_FAILED,
      WorkflowEvents.NODE_STARTED,
      WorkflowEvents.NODE_COMPLETED,
      WorkflowEvents.NODE_FAILED,
      WorkflowEvents.NODE_LOG,
      WorkflowEvents.NODE_RESULT,
      WorkflowEvents.TOOL_STARTED,
      WorkflowEvents.TOOL_COMPLETED,
      WorkflowEvents.TOOL_FAILED,
      WorkflowEvents.AGENT_NOTIFICATION,
    ] as const;

    for (const eventType of allEvents) {
      this.executor.on(eventType, (event: WorkflowEvent<typeof eventType>) =>
        this.handleEvent(event),
      );
    }
  }

  private async handleEvent<T extends WorkflowEventType>(
    event: WorkflowEvent<T>,
  ): Promise<void> {
    await this.notifier.publish(event);
  }
}
