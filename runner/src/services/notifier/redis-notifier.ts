import Redis from "ioredis";
import { INotifier, WorkflowEvent } from "./notifier.interface";
import { logger } from "../../utils/logger";

export class RedisNotifier implements INotifier {
  private redis: Redis;
  private readonly EVENTS_TOPIC = "workflow.events.in";

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);

    this.redis.on("error", (err) => {
      logger.error(`redis error: ${err}`);
    });
  }

  async initialize(): Promise<void> {
    try {
      await this.redis.ping();
      logger.info("redis notifier initialized successfully");
    } catch (err) {
      logger.error(`failed to initialize redis notifier: ${err}`);
      throw err;
    }
  }

  async publishEvent(event: WorkflowEvent): Promise<string> {
    try {
      const message = {
        payload: JSON.stringify(event),
        metadata: {
          correlation_id: event.triggerId,
          event_type: event.type,
          timestamp: new Date().toISOString(),
        },
      };

      const id = await this.redis.xadd(
        this.EVENTS_TOPIC,
        "*",
        "payload",
        JSON.stringify(message.payload),
        "metadata",
        JSON.stringify(message.metadata)
      );

      logger.debug(
        `published event to ${this.EVENTS_TOPIC}: ${JSON.stringify(event)}`
      );
      return id || "";
    } catch (err) {
      logger.error(`failed to publish event: ${err}`);
      throw err;
    }
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}
