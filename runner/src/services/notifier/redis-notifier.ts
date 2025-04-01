import Redis from "ioredis";
import * as msgpack from "msgpack-lite";
import { RedisConfig } from "../../utils/config";
import { logger } from "../../utils/logger";
import { INotifier, WorkflowEvent } from "./notifier.interface";

const DEFAULT_MAX_EVENTS_LENGTH = 500;
const DEFAULT_MAX_RESULTS_LENGTH = 1000;
const HEADER_MESSAGE_ID = "_watermill_message_uuid";

const STREAMS = {
  STORE: "workflows:upstream:events:store",
  DISPATCH: "workflows:upstream:events:dispatch",
  NODE_RESULTS: "workflows:upstream:nodes:results",
} as const;

type RedisStreamId = string;
type StreamName = (typeof STREAMS)[keyof typeof STREAMS];
type EventContext = "dispatch workflow event" | "node result" | "node log";

export class RedisNotifier implements INotifier {
  private redis: Redis;
  private readonly WORKFLOW_DISPATCH_STREAM = STREAMS.DISPATCH;
  private readonly NODE_RESULTS_STREAM = STREAMS.NODE_RESULTS;
  constructor(config: RedisConfig) {
    this.redis = this.initializeRedisClient(config);
  }

  private initializeRedisClient(config: RedisConfig): Redis {
    const redisOptions = { password: config.password };
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

  private async publish(
    stream: StreamName,
    maxStreamLength: number,
    event: WorkflowEvent,
    context: EventContext,
  ): Promise<RedisStreamId> {
    try {
      const metadata = this.encodeMetadata(event);
      return await this.publishToStream(
        stream,
        maxStreamLength,
        event,
        metadata,
      );
    } catch (err) {
      logger.error(`failed to publish ${context}: ${err}`);
      throw err;
    }
  }

  private encodeMetadata(event: WorkflowEvent): Buffer {
    return msgpack.encode({
      correlation_id: event.triggerId.toString(),
    });
  }

  private async publishToStream(
    stream: StreamName,
    maxStreamLength: number,
    event: WorkflowEvent,
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

  async publishWorkflowEvent(event: WorkflowEvent): Promise<RedisStreamId> {
    logger.info(
      `publishing workflow event ${event.type} to ${this.WORKFLOW_DISPATCH_STREAM} - with triggerId: ${event.triggerId}`,
    );
    // listenning by the backend without consumer group
    // only the instance who has a client subscribed
    // will dispatch the event to the SDK
    return this.publish(
      this.WORKFLOW_DISPATCH_STREAM,
      DEFAULT_MAX_EVENTS_LENGTH,
      event,
      "dispatch workflow event",
    );
  }

  async publishNodeLog(event: WorkflowEvent): Promise<RedisStreamId> {
    return this.publish(
      this.NODE_RESULTS_STREAM,
      DEFAULT_MAX_RESULTS_LENGTH,
      event,
      "node log",
    );
  }
  async close(): Promise<void> {
    await this.redis.quit();
  }
}
