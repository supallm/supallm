import Redis from "ioredis";
import { INotifier, WorkflowEvent } from "./notifier.interface";
import { logger } from "../../utils/logger";
import * as msgpack from "msgpack-lite";

export class RedisNotifier implements INotifier {
  private redis: Redis;
  private readonly WORKFLOW_STORE_STREAM = "workflows:upstream:events:store";
  private readonly WORKFLOW_DISPATCH_STREAM =
    "workflows:upstream:events:dispatch";
  private readonly NODE_RESULTS_STREAM = "workflows:upstream:nodes:results";
  private MAX_STREAM_EVENTS_LENGTH: number = 500; // default max length for the stream of events
  private MAX_STREAM_RESULTS_LENGTH: number = 1000; // default max length for the results stream
  private HEADER_MESSAGE_ID = "_watermill_message_uuid"; // header key for the message id

  constructor(redisUrl: string) {
    const redisOptions = { password: process.env.REDIS_PASSWORD };
    this.redis = new Redis(redisUrl, redisOptions);

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

  private async publish(
    stream: string,
    maxStreamLength: number,
    event: WorkflowEvent,
    context: string
  ): Promise<string> {
    try {
      const metadata = msgpack.encode({
        correlation_id: event.triggerId.toString(),
      });

      const id = await this.redis.xadd(
        stream,
        "MAXLEN",
        "~",
        maxStreamLength,
        "*",
        this.HEADER_MESSAGE_ID,
        event.triggerId,
        "payload",
        JSON.stringify(event),
        "metadata",
        metadata
      );

      return id || "";
    } catch (err) {
      logger.error(`failed to publish ${context}: ${err}`);
      throw err;
    }
  }

  async publishWorkflowEvent(event: WorkflowEvent): Promise<string[]> {
    logger.debug(
      `published workflow event to ${
        this.WORKFLOW_STORE_STREAM
      }: ${JSON.stringify(event)}`
    );
    const [storeId, dispatchId] = await Promise.all([
      this.publish(
        this.WORKFLOW_STORE_STREAM,
        this.MAX_STREAM_EVENTS_LENGTH,
        event,
        "workflow event"
      ),
      this.publish(
        this.WORKFLOW_DISPATCH_STREAM,
        this.MAX_STREAM_EVENTS_LENGTH,
        event,
        "workflow event"
      ),
    ]);
    return [storeId, dispatchId];
  }

  async publishNodeResult(event: WorkflowEvent): Promise<string> {
    logger.debug(
      `published node result to ${this.NODE_RESULTS_STREAM}: ${JSON.stringify(
        event
      )}`
    );
    return this.publish(
      this.NODE_RESULTS_STREAM,
      this.MAX_STREAM_RESULTS_LENGTH,
      event,
      "node result"
    );
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}
