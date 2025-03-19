import {
  IContextService,
  ExecutionContext,
  ManagedExecutionContext,
} from "./context.interface";
import { logger } from "../../utils/logger";
import _ from "lodash";
import {
  WorkflowDefinition,
  WorkflowExecutionOptions,
} from "../workflow/types";
import Redis from "ioredis";

export class RedisContextService implements IContextService {
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
      db: 1,
      password: process.env.REDIS_PASSWORD,
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
    options: WorkflowExecutionOptions
  ): Promise<ManagedExecutionContext> {
    const existingContext = await this.getContext(workflowId);

    if (existingContext) {
      return new ManagedExecutionContext(this, workflowId, existingContext);
    }

    const newContext = this.initializeContext(workflowId, definition, options);
    await this.saveContext(workflowId, newContext);

    return new ManagedExecutionContext(this, workflowId, newContext);
  }

  private initializeContext(
    workflowId: string,
    definition: WorkflowDefinition,
    options: WorkflowExecutionOptions
  ): ExecutionContext {
    return {
      workflowId,
      sessionId: options.sessionId,
      triggerId: options.triggerId,
      nodeExecutions: {
        entrypoint: {
          id: "entrypoint",
          success: false,
          inputs: options.inputs || {},
          output: null,
          executionTime: 0,
        },
      },
      completedNodes: new Set<string>(),
      allNodes: new Set(Object.keys(definition.nodes)),
    };
  }

  private async getContext(
    workflowId: string
  ): Promise<ExecutionContext | null> {
    const key = this.getKey(workflowId);
    const data = await this.redis.get(key);

    if (!data) {
      logger.warn(`context for workflow ${workflowId} not found in Redis`);
      return null;
    }

    try {
      const parsedData = JSON.parse(data);
      return this.deserializeContext(parsedData);
    } catch (error) {
      logger.error(`Failed to parse context for workflow ${workflowId}`, error);
      return null;
    }
  }

  async getManagedContext(
    workflowId: string
  ): Promise<ManagedExecutionContext | null> {
    const context = await this.getContext(workflowId);
    if (!context) {
      return null;
    }
    return new ManagedExecutionContext(this, workflowId, context);
  }

  async updateContext(
    workflowId: string,
    update: Partial<ExecutionContext>
  ): Promise<void> {
    const context = await this.getContext(workflowId);

    if (!context) {
      logger.error(
        `cannot update context for workflow ${workflowId}: context not found in Redis`
      );
      throw new Error(`context for workflow ${workflowId} not found`);
    }

    const updatedContext = { ...context, ...update };
    await this.saveContext(workflowId, updatedContext);
  }

  async markNodeCompleted(workflowId: string, nodeId: string): Promise<void> {
    const context = await this.getContext(workflowId);

    if (!context) {
      logger.error(
        `cannot mark node ${nodeId} as completed: context for workflow ${workflowId} not found in Redis`
      );
      throw new Error(`context for workflow ${workflowId} not found`);
    }

    context.completedNodes.add(nodeId);
    await this.saveContext(workflowId, context);
  }

  private getKey(workflowId: string): string {
    return `${this.keyPrefix}${workflowId}`;
  }

  private async saveContext(
    workflowId: string,
    context: ExecutionContext
  ): Promise<void> {
    const key = this.getKey(workflowId);
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
