import Redis from "ioredis";
import _ from "lodash";
import { logger } from "../../utils/logger";
import {
  WorkflowDefinition,
  WorkflowExecutionOptions,
} from "../workflow/types";
import {
  ContextService,
  ExecutionContext,
  ManagedExecutionContext,
} from "./context.interface";

export class RedisContextService implements ContextService {
  private readonly keyPrefix = "workflow:context:";
  private redis: Redis;
  private ttl: number;

  // ttl is the time to live in seconds
  // default is 1 day
  constructor(redisUrl: string, ttl: number = 86400) {
    this.redis = this.initializeRedisClient(redisUrl);
    this.ttl = ttl;
  }

  private initializeRedisClient(redisUrl: string): Redis {
    const redisOptions = {
      db: 1, // context db
      password: process.env["REDIS_PASSWORD"],
      retryStrategy: (times: number) => {
        return Math.min(times * 100, 3000); // retry with an increasing delay
      },
      maxRetriesPerRequest: 3,
    };
    const redis = new Redis(redisUrl, redisOptions);

    redis.on("error", (err) => {
      logger.error(`redis error: ${err}`);
    });

    return redis;
  }

  async initialize(
    workflowId: string,
    definition: WorkflowDefinition,
    options: WorkflowExecutionOptions,
  ): Promise<ManagedExecutionContext> {
    const triggerId = options.triggerId;
    const existingContext = await this.getContext(workflowId, triggerId);

    if (existingContext) {
      return new ManagedExecutionContext(
        this,
        workflowId,
        triggerId,
        existingContext,
      );
    }

    const newContext = this.initializeContext(workflowId, definition, options);
    await this.saveContext(workflowId, triggerId, newContext);

    return new ManagedExecutionContext(this, workflowId, triggerId, newContext);
  }

  private initializeContext(
    workflowId: string,
    definition: WorkflowDefinition,
    options: WorkflowExecutionOptions,
  ): ExecutionContext {
    return {
      workflowId,
      sessionId: options.sessionId,
      triggerId: options.triggerId,
      workflowInputs: options.inputs,
      nodeExecutions: {},
      completedNodes: new Set<string>(),
      allNodes: new Set(Object.keys(definition.nodes)),
    };
  }

  private async getContext(
    workflowId: string,
    triggerId: string,
  ): Promise<ExecutionContext | null> {
    const key = this.getKey(workflowId, triggerId);
    const data = await this.redis.get(key);

    if (!data) {
      logger.warn(`context for workflow ${workflowId} not found in Redis`);
      return null;
    }

    try {
      const parsedData = JSON.parse(data);
      return this.deserializeContext(parsedData);
    } catch (error) {
      logger.error(`failed to parse context for workflow ${workflowId}`, error);
      return null;
    }
  }

  async getManagedContext(
    workflowId: string,
    triggerId: string,
  ): Promise<ManagedExecutionContext | null> {
    const context = await this.getContext(workflowId, triggerId);
    if (!context) {
      return null;
    }
    return new ManagedExecutionContext(this, workflowId, triggerId, context);
  }

  async updateContext(
    workflowId: string,
    triggerId: string,
    update: Partial<ExecutionContext>,
  ): Promise<void> {
    const context = await this.getContext(workflowId, triggerId);

    if (!context) {
      logger.error(
        `cannot update context for workflow ${workflowId}: context not found in Redis`,
      );
      throw new Error(`context for workflow ${workflowId} not found`);
    }

    const updatedContext = { ...context, ...update };
    await this.saveContext(workflowId, triggerId, updatedContext);
  }

  async markNodeCompleted(
    workflowId: string,
    triggerId: string,
    nodeId: string,
  ): Promise<void> {
    const context = await this.getContext(workflowId, triggerId);

    if (!context) {
      logger.error(
        `cannot mark node ${nodeId} as completed: context for workflow ${workflowId} not found in Redis`,
      );
      throw new Error(`context for workflow ${workflowId} not found`);
    }

    context.completedNodes.add(nodeId);
    await this.saveContext(workflowId, triggerId, context);
  }

  private getKey(workflowId: string, triggerId: string): string {
    return `${this.keyPrefix}${workflowId}:${triggerId}`;
  }

  private async saveContext(
    workflowId: string,
    triggerId: string,
    context: ExecutionContext,
  ): Promise<void> {
    const key = this.getKey(workflowId, triggerId);
    const serialized = this.serializeContext(context);
    await this.redis.set(key, JSON.stringify(serialized), "EX", this.ttl);
  }

  private serializeContext(context: ExecutionContext): any {
    return {
      ..._.cloneDeep(context),
      completedNodes: Array.from(context.completedNodes),
      allNodes: Array.from(context.allNodes),
    };
  }

  private deserializeContext(data: any): ExecutionContext {
    return {
      ...data,
      completedNodes: new Set<string>(data.completedNodes || []),
      allNodes: new Set<string>(data.allNodes || []),
    };
  }
}
