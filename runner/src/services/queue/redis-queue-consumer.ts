import Redis from "ioredis";
import { IQueueConsumer, WorkflowMessage } from "./queuer.interface";
import { logger } from "../../utils/logger";

export class RedisQueueConsumer implements IQueueConsumer {
  private redis: Redis;
  private readonly QUEUE_TOPIC = "workflows:queue";
  private readonly CONSUMER_GROUP = "runner-group";
  private readonly CONSUMER_NAME: string;
  private isConsuming: boolean = false;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
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

      // Create the consumer group if it doesn't exist
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
        // Ignore the error if the group already exists
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

  consumeWorkflowQueue(
    handler: (message: WorkflowMessage) => Promise<void>
  ): void {
    if (this.isConsuming) {
      logger.warn("already consuming from workflow queue");
      return;
    }

    this.isConsuming = true;

    const consumeMessages = async () => {
      while (this.isConsuming) {
        try {
          // Read unprocessed messages
          const messages = await this.redis.xreadgroup(
            "GROUP",
            this.CONSUMER_GROUP,
            this.CONSUMER_NAME,
            "COUNT",
            1,
            "BLOCK",
            1000,
            "STREAMS",
            this.QUEUE_TOPIC,
            ">"
          );

          if (!messages || messages.length === 0) {
            continue;
          }

          for (const [_, entries] of messages) {
            for (const [id, fields] of entries) {
              try {
                // Extract the message
                const messageStr = fields[1] as string;
                const message: WorkflowMessage = JSON.parse(messageStr);

                // Process the message
                await handler(message);

                // Acknowledge the message
                await this.redis.xack(
                  this.QUEUE_TOPIC,
                  this.CONSUMER_GROUP,
                  id
                );
              } catch (err) {
                logger.error(`error processing message ${id}: ${err}`);
              }
            }
          }
        } catch (err) {
          logger.error(`error consuming from workflow queue: ${err}`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    };

    consumeMessages();
  }

  async close(): Promise<void> {
    this.isConsuming = false;
    await this.redis.quit();
  }
}
