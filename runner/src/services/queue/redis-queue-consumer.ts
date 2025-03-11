import Redis from "ioredis";
import { IQueueConsumer, WorkflowMessage } from "./queuer.interface";
import { logger } from "../../utils/logger";

export class RedisQueueConsumer implements IQueueConsumer {
  private redis: Redis;
  private readonly QUEUE_TOPIC = "workflows:queue";
  private readonly CONSUMER_GROUP = "runner-group";
  private readonly CONSUMER_NAME: string;

  constructor(redisUrl: string) {
    const redisOptions = { password: process.env.REDIS_PASSWORD };
    this.redis = new Redis(redisUrl, redisOptions);
    this.CONSUMER_NAME = `runner-${Math.random()
      .toString(36)
      .substring(2, 10)}`;

    this.redis.on("error", (err) => {
      logger.error(`redis error: ${err}`);
    });
  }

  async initialize(): Promise<void> {
    try {
      await this.redis.ping();

      // create the consumer group if it doesn't exist
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
        // ignore the error if the group already exists
        if (!(err instanceof Error) || !err.message.includes("BUSYGROUP")) {
          throw err;
        }
      }

      logger.info("redis queue consumer initialized successfully");
    } catch (err) {
      logger.error(`failed to initialize redis queue consumer: ${err}`);
      throw err;
    }
  }

  async consumeWorkflowQueue(
    handler: (message: WorkflowMessage) => Promise<void>
  ): Promise<void> {
    try {
      while (true) {
        const result = await this.redis.xreadgroup(
          "GROUP",
          this.CONSUMER_GROUP,
          this.CONSUMER_NAME,
          "COUNT",
          1,
          "BLOCK",
          0,
          "STREAMS",
          this.QUEUE_TOPIC,
          ">"
        );

        if (!result) continue;

        for (const [_, messages] of result as [
          string,
          [string, string[]][]
        ][]) {
          for (const [messageId, fields] of messages) {
            try {
              const payload = fields.find(
                (_, index) => fields[index - 1] === "payload"
              );

              if (!payload) {
                logger.error(`no payload found in message ${messageId}`);
                continue;
              }

              const message: WorkflowMessage = JSON.parse(payload);
              await handler(message);
              await this.redis.xack(
                this.QUEUE_TOPIC,
                this.CONSUMER_GROUP,
                messageId
              );
            } catch (err) {
              logger.error(`error processing message ${messageId}: ${err}`);
            }
          }
        }
      }
    } catch (err) {
      logger.error(`redis error: ${err}`);
      throw err;
    }
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}
