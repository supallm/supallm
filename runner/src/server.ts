import { IContextService, RedisContextService } from "./services/context";
import { RedisMemoryService } from "./services/llm-memory/redis-llm-memory-service";
import { NodeManager } from "./services/node/node-manager";
import { INotifier, RedisNotifier, WorkflowEvents } from "./services/notifier";
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
    this.queueConsumer = new RedisQueueConsumer(config.redisUrl, {
      maxParallelJobs: config.maxConcurrentJobs,
    });
    const memoryService = new RedisMemoryService(config.redisUrl);
    this.notifier = new RedisNotifier(config.redisUrl);
    this.nodeManager = new NodeManager(memoryService);
    this.contextService = new RedisContextService(config.redisUrl);
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
    const workflowEvents = [
      WorkflowEvents.WORKFLOW_STARTED,
      WorkflowEvents.WORKFLOW_COMPLETED,
      WorkflowEvents.WORKFLOW_FAILED,
      WorkflowEvents.NODE_STARTED,
      WorkflowEvents.NODE_COMPLETED,
      WorkflowEvents.NODE_FAILED,
    ] as const;

    for (const eventType of workflowEvents) {
      this.executor.on(eventType, (data: any) =>
        this.handleWorkflowEvent(eventType, data),
      );
    }

    this.executor.on(
      WorkflowEvents.NODE_RESULT,
      this.handleNodeResult.bind(this),
    );

    this.executor.on(WorkflowEvents.NODE_LOG, this.handleNodeLog.bind(this));
  }

  private async handleWorkflowEvent(
    eventType: (typeof WorkflowEvents)[keyof typeof WorkflowEvents],
    data: any,
  ): Promise<void> {
    await this.notifier.publishWorkflowEvent({
      type: eventType,
      workflowId: data.workflowId,
      triggerId: data.triggerId,
      sessionId: data.sessionId,
      data: this.extractEventData(eventType, data),
    });
  }

  private extractEventData(
    eventType: (typeof WorkflowEvents)[keyof typeof WorkflowEvents],
    data: any,
  ): any {
    switch (eventType) {
      case WorkflowEvents.WORKFLOW_STARTED:
        return { inputs: data.inputs };
      case WorkflowEvents.WORKFLOW_COMPLETED:
        return { result: data.result };
      case WorkflowEvents.WORKFLOW_FAILED:
        return { error: data.error };
      case WorkflowEvents.NODE_STARTED:
        return {
          nodeId: data.nodeId,
          type: data.nodeType,
          inputs: data.inputs,
        };
      case WorkflowEvents.NODE_COMPLETED:
        return {
          nodeId: data.nodeId,
          nodeType: data.nodeType,
          output: data.output,
        };
      case WorkflowEvents.NODE_FAILED:
        return {
          nodeId: data.nodeId,
          nodeType: data.nodeType,
          error: data.error,
        };
      default:
        return data;
    }
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

  private async handleNodeLog(data: any): Promise<void> {
    await this.notifier.publishNodeLog({
      type: WorkflowEvents.NODE_LOG,
      workflowId: data.workflowId,
      triggerId: data.triggerId,
      sessionId: data.sessionId,
      data: {
        nodeId: data.nodeId,
        nodeType: data.nodeType,
        message: data.message,
      },
    });
  }
}
