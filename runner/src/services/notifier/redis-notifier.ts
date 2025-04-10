import Redis from "ioredis";
import * as msgpack from "msgpack-lite";
import { dbRedis, RedisConfig } from "../../utils/config";
import { logger } from "../../utils/logger";
import {
  INotifier,
  WorkflowEvent,
  WorkflowEventType,
} from "./notifier.interface";

const DEFAULT_MAX_EVENTS_LENGTH = 1000;
const HEADER_MESSAGE_ID = "_watermill_message_uuid";

const STREAMS = {
  DISPATCH: "workflows:upstream:events:dispatch",
} as const;

type RedisStreamId = string;
type StreamName = (typeof STREAMS)[keyof typeof STREAMS];

export class RedisNotifier implements INotifier {
  private redis: Redis;
  private readonly WORKFLOW_DISPATCH_STREAM = STREAMS.DISPATCH;

  constructor(config: RedisConfig) {
    this.redis = this.initializeRedisClient(config);
  }

  private initializeRedisClient(config: RedisConfig): Redis {
    const redisOptions = {
      password: config.password,
      family: 0,
      db: dbRedis.EXECUTIONS,
    };
    const redis = new Redis(config.url, redisOptions);

    redis.on("error", (err) => {
      logger.error(`redis error: ${err}`);
    });

    return redis;
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

  async publish<T extends WorkflowEventType>(
    event: WorkflowEvent<T>,
  ): Promise<RedisStreamId> {
    try {
      const metadata = this.encodeMetadata(event);
      if (event.type !== "NODE_RESULT") {
        logger.info(
          `publishing event ${event.type} to ${this.WORKFLOW_DISPATCH_STREAM} - with triggerId: ${event.triggerId}`,
        );
      }
      return await this.publishToStream(
        this.WORKFLOW_DISPATCH_STREAM,
        DEFAULT_MAX_EVENTS_LENGTH,
        event,
        metadata,
      );
    } catch (err) {
      logger.error(`failed to publish event ${event.type}: ${err}`);
      throw err;
    }
  }

  private encodeMetadata<T extends WorkflowEventType>(
    event: WorkflowEvent<T>,
  ): Buffer {
    return msgpack.encode({
      correlation_id: event.triggerId.toString(),
    });
  }

  private async publishToStream<T extends WorkflowEventType>(
    stream: StreamName,
    maxStreamLength: number,
    event: WorkflowEvent<T>,
    metadata: Buffer,
  ): Promise<RedisStreamId> {
    const id = await this.redis.xadd(
      stream,
      "MAXLEN",
      "~",
      maxStreamLength,
      "*",
      HEADER_MESSAGE_ID,
      event.triggerId,
      "payload",
      JSON.stringify(event),
      "metadata",
      metadata,
    );

    return id || "";
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}
