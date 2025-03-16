import Redis from "ioredis";
import { IQueueConsumer, WorkflowMessage } from "./queuer.interface";
import { logger } from "../../utils/logger";

interface RedisStreamMessage {
  id: string;
  fields: string[];
}

interface RedisStreamResult {
  streamName: string;
  messages: RedisStreamMessage[];
}

type RedisStreamResponse = [
  streamName: string,
  messages: [messageId: string, fields: string[]][]
][];

const DEFAULT_MAX_PARALLEL_JOBS = 10;
const BLOCK_TIMEOUT = 0; // 0 = infini
const POLLING_INTERVAL = 100; // ms

interface RedisQueueOptions {
  maxParallelJobs?: number;
}

export class RedisQueueConsumer implements IQueueConsumer {
  private redis: Redis;
  private readonly QUEUE_TOPIC = "workflows:downstream:run";
  private readonly CONSUMER_GROUP = "runner-consumer-group";
  private readonly CONSUMER_NAME: string;
  private readonly MAX_PARALLEL_JOBS: number;
  private activeJobs = 0;
  private isRunning = true;

  constructor(redisUrl: string, options?: RedisQueueOptions) {
    this.redis = this.initializeRedisClient(redisUrl);
    this.CONSUMER_NAME = this.generateConsumerName();
    this.MAX_PARALLEL_JOBS =
      options?.maxParallelJobs ?? DEFAULT_MAX_PARALLEL_JOBS;
  }

  private initializeRedisClient(redisUrl: string): Redis {
    const redisOptions = { password: process.env.REDIS_PASSWORD };
    const redis = new Redis(redisUrl, redisOptions);

    redis.on("error", (err) => {
      logger.error(`redis error: ${err}`);
    });

    return redis;
  }

  private generateConsumerName(): string {
    return `runner-${Math.random().toString(36).substring(2, 10)}`;
  }

  async initialize(): Promise<void> {
    try {
      await this.redis.ping();
      await this.createConsumerGroup();
      logger.info("redis queue consumer initialized successfully");
    } catch (err) {
      logger.error(`failed to initialize redis queue consumer: ${err}`);
      throw err;
    }
  }

  private async createConsumerGroup(): Promise<void> {
    try {
      await this.redis.xgroup(
        "CREATE",
        this.QUEUE_TOPIC,
        this.CONSUMER_GROUP,
        "0",
        "MKSTREAM"
      );
      logger.info(
        `created consumer group ${this.CONSUMER_GROUP} for ${this.QUEUE_TOPIC}`
      );
    } catch (err) {
      if (!(err instanceof Error) || !err.message.includes("BUSYGROUP")) {
        throw err;
      }
    }
  }

  async consumeWorkflowQueue(
    handler: (message: WorkflowMessage) => Promise<void>
  ): Promise<void> {
    try {
      logger.info(
        `consuming workflow queue with ${this.MAX_PARALLEL_JOBS} parallel jobs`
      );
      while (this.isRunning) {
        await this.waitForAvailableSlot();
        const messages = await this.readMessages();
        if (!messages) continue;
        this.processMessages(messages, handler);
      }
    } catch (err) {
      logger.error(`redis error: ${err}`);
      throw err;
    }
  }

  private async waitForAvailableSlot(): Promise<void> {
    while (this.activeJobs >= this.MAX_PARALLEL_JOBS) {
      logger.info(`waiting for available slot`);
      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
    }
  }

  private async readMessages(): Promise<RedisStreamResult[] | null> {
    logger.info(`reading messages on topic ${this.QUEUE_TOPIC}`);
    const result = (await this.redis.xreadgroup(
      "GROUP",
      this.CONSUMER_GROUP,
      this.CONSUMER_NAME,
      "COUNT",
      this.MAX_PARALLEL_JOBS - this.activeJobs,
      "BLOCK",
      BLOCK_TIMEOUT,
      "STREAMS",
      this.QUEUE_TOPIC,
      ">"
    )) as RedisStreamResponse;

    if (!result) return null;

    return result.map(([streamName, messages]) => ({
      streamName,
      messages: messages.map(([id, fields]) => ({ id, fields })),
    }));
  }

  private processMessages(
    result: RedisStreamResult[],
    handler: (message: WorkflowMessage) => Promise<void>
  ): void {
    logger.info(`processing messages`);
    const streamResults = result;

    for (const { messages } of streamResults) {
      for (const { id: messageId, fields } of messages) {
        this.activeJobs++;
        this.processMessage(messageId, fields, handler).finally(() => {
          this.activeJobs--;
        });
      }
    }
  }

  private async processMessage(
    messageId: string,
    fields: string[],
    handler: (message: WorkflowMessage) => Promise<void>
  ): Promise<void> {
    try {
      const message = this.extractMessage(fields);
      if (!message) {
        await this.acknowledgeMessage(messageId);
        return;
      }

      await handler(message);
      await this.acknowledgeMessage(messageId);
    } catch (err) {
      logger.error(`error processing message ${messageId}: ${err}`);
    }
  }

  private extractMessage(fields: string[]): WorkflowMessage | null {
    const payload = fields.find((_, index) => fields[index - 1] === "payload");
    if (!payload) {
      logger.error("no payload found in message");
      return null;
    }
    return JSON.parse(payload);
  }

  private async acknowledgeMessage(messageId: string): Promise<void> {
    await this.redis.xack(this.QUEUE_TOPIC, this.CONSUMER_GROUP, messageId);
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    await this.close();
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}
