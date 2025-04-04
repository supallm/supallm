import Redis from "ioredis";
import { logger } from "../../utils/logger";
import { IQueueConsumer, WorkflowMessage } from "./queuer.interface";
import { PendingMessageInfo } from "./types";

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
  messages: [messageId: string, fields: string[]][],
][];

const DEFAULT_MAX_PARALLEL_JOBS = 10;
const BLOCK_TIMEOUT = 0; // 0 = infini
const POLLING_INTERVAL = 100; // ms

interface RedisQueueOptions {
  maxParallelJobs?: number;
}

export class RedisQueueConsumer implements IQueueConsumer {
  private redisBlocking: Redis;
  private redisNonBlocking: Redis;
  private readonly QUEUE_TOPIC = "workflows:downstream:run";
  private readonly CONSUMER_GROUP = "runner-consumer-group";
  private readonly CONSUMER_NAME: string;
  private readonly MAX_PARALLEL_JOBS: number;
  private activeJobs = 0;
  private isRunning = true;

  constructor(redisUrl: string, options: RedisQueueOptions) {
    this.redisBlocking = this.initializeRedisClient(redisUrl);
    this.redisNonBlocking = this.initializeRedisClient(redisUrl);
    this.CONSUMER_NAME = this.generateConsumerName();
    this.MAX_PARALLEL_JOBS =
      options?.maxParallelJobs ?? DEFAULT_MAX_PARALLEL_JOBS;
  }

  private initializeRedisClient(redisUrl: string): Redis {
    const redisOptions = {
      family: 0,
      db: 0,
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

  private generateConsumerName(): string {
    return `runner-${Math.random().toString(36).substring(2, 10)}`;
  }

  async initialize(): Promise<void> {
    try {
      await this.redisBlocking.ping();
      await this.redisNonBlocking.ping();
      await this.createConsumerGroup();
      await this.cleanupInactiveConsumers();
      logger.info("redis queue consumer initialized successfully");
    } catch (err) {
      logger.error(`failed to initialize redis queue consumer: ${err}`);
      throw err;
    }
  }

  private getRemainingSlots(): string {
    return `${this.MAX_PARALLEL_JOBS - this.activeJobs}/${
      this.MAX_PARALLEL_JOBS
    }`;
  }

  private async createConsumerGroup(): Promise<void> {
    try {
      await this.redisNonBlocking.xgroup(
        "CREATE",
        this.QUEUE_TOPIC,
        this.CONSUMER_GROUP,
        "0",
        "MKSTREAM",
      );
      logger.info(
        `created consumer group ${this.CONSUMER_GROUP} for ${this.QUEUE_TOPIC}`,
      );
    } catch (err) {
      if (!(err instanceof Error) || !err.message.includes("BUSYGROUP")) {
        throw err;
      }
    }
  }

  async consumeWorkflowQueue(
    handler: (message: WorkflowMessage) => Promise<void>,
  ): Promise<void> {
    try {
      logger.info(
        `consuming topic ${
          this.QUEUE_TOPIC
        } - remaining slots: ${this.getRemainingSlots()}`,
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
    if (this.activeJobs >= this.MAX_PARALLEL_JOBS) {
      logger.info(
        `waiting for available slot, all the ${this.MAX_PARALLEL_JOBS} slots are taken`,
      );
    }
    while (this.activeJobs >= this.MAX_PARALLEL_JOBS) {
      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
    }
  }

  private async readMessages(): Promise<RedisStreamResult[] | null> {
    const result = (await this.redisBlocking.xreadgroup(
      "GROUP",
      this.CONSUMER_GROUP,
      this.CONSUMER_NAME,
      "COUNT",
      this.MAX_PARALLEL_JOBS - this.activeJobs,
      "BLOCK",
      BLOCK_TIMEOUT,
      "STREAMS",
      this.QUEUE_TOPIC,
      ">",
    )) as RedisStreamResponse;

    if (!result) return null;

    return result.map(([streamName, messages]) => ({
      streamName,
      messages: messages.map(([id, fields]) => ({ id, fields })),
    }));
  }

  private processMessages(
    result: RedisStreamResult[],
    handler: (message: WorkflowMessage) => Promise<void>,
  ): void {
    const streamResults = result;

    for (const { messages } of streamResults) {
      for (const { id: messageId, fields } of messages) {
        this.activeJobs++;
        logger.info(
          `processing new job ${messageId} - remaining slots: ${this.getRemainingSlots()}`,
        );
        this.processMessage(messageId, fields, handler).then(() => {
          this.activeJobs--;
          logger.info(
            `completed job ${messageId} - remaining slots: ${this.getRemainingSlots()}`,
          );
        });
      }
    }
  }

  private async processMessage(
    messageId: string,
    fields: string[],
    handler: (message: WorkflowMessage) => Promise<void>,
  ): Promise<void> {
    try {
      const message = this.extractMessage(fields);
      if (!message) {
        await this.acknowledgeMessage(messageId);
        return;
      }
      logger.info(
        `processing workflow ${message.workflow_id} - triggerId: ${message.trigger_id}`,
      );
      await handler(message);
    } catch (err) {
      logger.error(`error processing message ${messageId}: ${err}`);
    } finally {
      await this.acknowledgeMessage(messageId);
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
    await this.redisNonBlocking.xack(
      this.QUEUE_TOPIC,
      this.CONSUMER_GROUP,
      messageId,
    );
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    await this.close();
  }

  async close(): Promise<void> {
    await this.redisBlocking.quit();
    await this.redisNonBlocking.quit();
  }

  // cleanup inactive consumers
  // idleThresholdMs: the time in ms after which a consumer is considered inactive
  // default: 300000ms = 5min
  async cleanupInactiveConsumers(
    idleThresholdMs: number = 3000,
  ): Promise<void> {
    try {
      const consumersInfo = await this.redisNonBlocking.xinfo(
        "CONSUMERS",
        this.QUEUE_TOPIC,
        this.CONSUMER_GROUP,
      );

      if (!consumersInfo || !Array.isArray(consumersInfo)) {
        logger.warn("failed to get consumers info or no consumers found");
        return;
      }

      logger.info(
        `joining ${consumersInfo.length} consumers in group ${this.CONSUMER_GROUP}`,
      );

      // Format: ["name","runner-xyz","pending",0,"idle",12345,"inactive",-1]
      for (const consumerInfo of consumersInfo) {
        const consumerName = consumerInfo[1];
        const pendingMessages = parseInt(consumerInfo[3], 10);
        const idleTimeMs = parseInt(consumerInfo[5], 10);

        if (consumerName === this.CONSUMER_NAME) {
          continue;
        }

        if (idleTimeMs > idleThresholdMs) {
          logger.info(
            `found inactive consumer ${consumerName} (idle for ${idleTimeMs}ms)`,
          );

          if (pendingMessages > 0) {
            // get the ids of the pending messages for this consumer
            const pendingMessagesInfo = (await this.redisNonBlocking.xpending(
              this.QUEUE_TOPIC,
              this.CONSUMER_GROUP,
              "-", // minimum id
              "+", // maximum id
              pendingMessages,
              consumerName,
            )) as PendingMessageInfo[];

            if (pendingMessagesInfo && pendingMessagesInfo.length > 0) {
              const messageIds = pendingMessagesInfo.map((msg) => msg[0]);

              await this.redisNonBlocking.xclaim(
                this.QUEUE_TOPIC,
                this.CONSUMER_GROUP,
                this.CONSUMER_NAME,
                0, // no idle time
                ...messageIds,
              );

              for (const messageId of messageIds) {
                await this.redisNonBlocking.xack(
                  this.QUEUE_TOPIC,
                  this.CONSUMER_GROUP,
                  messageId,
                );
              }

              logger.info(
                `successfully cleaned up ${messageIds.length} pending messages from ${consumerName}`,
              );
            }
          }

          await this.redisNonBlocking.xgroup(
            "DELCONSUMER",
            this.QUEUE_TOPIC,
            this.CONSUMER_GROUP,
            consumerName,
          );
          logger.info(`successfully removed inactive consumer ${consumerName}`);
        }
      }
    } catch (error) {
      logger.error(`failed to cleanup inactive consumers: ${error}`);
    }
  }
}
