import Redis from "ioredis";
import { logger } from "../utils/logger";
import { v4 as uuidv4 } from "uuid";
import { WorkflowDefinition } from "../models/workflow";

export interface WorkflowQueueMessage {
  workflow_id: string;
  trigger_id: string;
  project_id: string;
  definition: WorkflowDefinition;
  inputs: Record<string, any>;
}

export interface WorkflowEventMessage {
  type: string;
  workflow_id: string;
  trigger_id: string;
  session_id: string;
  node_id?: string;
  data?: Record<string, any>;
}

export class RedisService {
  private redis: Redis;
  private consumerGroup = "runner";
  private consumerId: string;

  // Topics
  private readonly QUEUE_TOPIC = "workflow.queue";
  private readonly EVENTS_TOPIC = "workflow.events.in";

  // Event types
  readonly EVENT_WORKFLOW_STARTED = "WORKFLOW_STARTED";
  readonly EVENT_WORKFLOW_COMPLETED = "WORKFLOW_COMPLETED";
  readonly EVENT_WORKFLOW_FAILED = "WORKFLOW_FAILED";
  readonly EVENT_NODE_STARTED = "NODE_STARTED";
  readonly EVENT_NODE_STREAMING = "NODE_STREAMING";
  readonly EVENT_NODE_COMPLETED = "NODE_COMPLETED";
  readonly EVENT_NODE_FAILED = "NODE_FAILED";

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
    this.consumerId = `runner-${uuidv4().substring(0, 8)}`;

    this.redis.on("error", (err) => {
      logger.error(`Redis error: ${err}`);
    });
  }

  async initialize(): Promise<void> {
    try {
      // Create consumer group for workflow queue if it doesn't exist
      try {
        await this.redis.xgroup(
          "CREATE",
          this.QUEUE_TOPIC,
          this.consumerGroup,
          "0",
          "MKSTREAM"
        );
        logger.info(
          `Created consumer group ${this.consumerGroup} for stream ${this.QUEUE_TOPIC}`
        );
      } catch (err: any) {
        // Ignore BUSYGROUP error (group already exists)
        if (!err.message.includes("BUSYGROUP")) {
          throw err;
        }
      }
    } catch (err) {
      logger.error(`Failed to initialize Redis streams: ${err}`);
      throw err;
    }
  }

  async publishEvent(event: WorkflowEventMessage): Promise<string> {
    try {
      const id = await this.redis.xadd(
        this.EVENTS_TOPIC,
        "*",
        "payload",
        JSON.stringify(event)
      );
      logger.debug(
        `Published event to ${this.EVENTS_TOPIC}: ${JSON.stringify(event)}`
      );
      return id;
    } catch (err) {
      logger.error(`Failed to publish event: ${err}`);
      throw err;
    }
  }

  async consumeWorkflowQueue(
    handler: (message: WorkflowQueueMessage) => Promise<void>
  ): Promise<void> {
    while (true) {
      try {
        // Read from the stream with XREADGROUP
        const streams = await this.redis.xreadgroup(
          "GROUP",
          this.consumerGroup,
          this.consumerId,
          "COUNT",
          "1",
          "BLOCK",
          "2000",
          "STREAMS",
          this.QUEUE_TOPIC,
          ">"
        );

        if (!streams || streams.length === 0) {
          continue;
        }

        const [streamName, messages] = streams[0];

        for (const [messageId, fields] of messages) {
          try {
            // Parse the message
            const payloadStr = fields[1] as string;
            const message: WorkflowQueueMessage = JSON.parse(payloadStr);

            logger.info(
              `Processing workflow: ${message.workflow_id}, trigger: ${message.trigger_id}`
            );

            // Handle the message
            await handler(message);

            // Acknowledge the message
            await this.redis.xack(
              this.QUEUE_TOPIC,
              this.consumerGroup,
              messageId
            );
          } catch (err) {
            logger.error(`Error processing message ${messageId}: ${err}`);
            // Consider implementing a dead-letter queue or retry mechanism
          }
        }
      } catch (err) {
        logger.error(`Error consuming from queue: ${err}`);
        // Wait a bit before retrying to avoid tight loop in case of persistent errors
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}
