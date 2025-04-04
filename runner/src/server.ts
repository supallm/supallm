import { IContextService, RedisContextService } from "./services/context";
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
    const workflowEvents = [
      WorkflowEvents.WORKFLOW_STARTED,
      WorkflowEvents.WORKFLOW_COMPLETED,
      WorkflowEvents.WORKFLOW_FAILED,
      WorkflowEvents.NODE_STARTED,
      WorkflowEvents.NODE_COMPLETED,
      WorkflowEvents.NODE_FAILED,
      WorkflowEvents.NODE_LOG,
      WorkflowEvents.NODE_RESULT,
      WorkflowEvents.AGENT_NOTIFICATION,
    ] as const;

    for (const eventType of workflowEvents) {
      this.executor.on(eventType, (data: any) =>
        this.handleWorkflowEvent(eventType, data),
      );
    }

    const nodeEvents = [
      WorkflowEvents.NODE_LOG,
      WorkflowEvents.NODE_RESULT,
      WorkflowEvents.AGENT_NOTIFICATION,
    ] as const;

    for (const eventType of nodeEvents) {
      this.executor.on(eventType, (data: any) =>
        this.handleNodeEvent(eventType, data),
      );
    }
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

  private async handleNodeEvent(
    eventType: (typeof WorkflowEvents)[keyof typeof WorkflowEvents],
    data: any,
  ): Promise<void> {
    await this.notifier.publishNodeEvent({
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
      case WorkflowEvents.NODE_LOG:
        return {
          nodeId: data.nodeId,
          nodeType: data.nodeType,
          message: data.message,
        };
      case WorkflowEvents.NODE_RESULT:
        return {
          nodeId: data.nodeId,
          nodeType: data.nodeType,
          outputField: data.outputField,
          data: data.data,
          type: data.type,
        };
      case WorkflowEvents.AGENT_NOTIFICATION:
        return {
          nodeId: data.nodeId,
          nodeType: data.nodeType,
          outputField: data.outputField,
          data: data.data,
          type: data.type,
        };
    }
  }
}
