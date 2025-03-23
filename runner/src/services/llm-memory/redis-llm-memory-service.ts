import {
  BaseMessage,
  mapChatMessagesToStoredMessages,
  mapStoredMessagesToChatMessages,
} from "@langchain/core/messages";
import Redis from "ioredis";
import { Result } from "typescript-result";
import { logger } from "../../utils/logger";

export class RedisMemoryService {
  private readonly redis: Redis;
  private readonly ttl: number;
  private readonly keyPrefix = "memory"; // memory:<sessionId>:<nodeId>

  constructor(redisUrl: string, ttl: number = 3600) {
    this.redis = this.initializeRedisClient(redisUrl);
    this.ttl = ttl;
  }

  private initializeRedisClient(redisUrl: string): Redis {
    const redisOptions = {
      db: 2, // memory db
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

  private getKey(sessionId: string, nodeId: string): string {
    return `${this.keyPrefix}:${sessionId}:${nodeId}`;
  }

  async getMessages(
    sessionId: string,
    nodeId: string,
  ): Promise<Result<BaseMessage[], Error>> {
    try {
      const key = this.getKey(sessionId, nodeId);
      const raw = await this.redis.get(key);
      if (!raw) return Result.ok([]);
      const parsed = JSON.parse(raw);

      const messages = mapStoredMessagesToChatMessages(parsed);
      return Result.ok(messages);
    } catch (e: any) {
      return Result.error(new Error(`failed to get messages: ${e.message}`));
    }
  }

  async addMessage(
    sessionId: string,
    nodeId: string,
    message: BaseMessage,
  ): Promise<Result<void, Error>> {
    try {
      const key = this.getKey(sessionId, nodeId);
      const raw = await this.redis.get(key);
      const current = raw ? JSON.parse(raw) : [];

      if (["tool", "function"].includes(message.getType())) {
        return Result.ok();
      }

      const stored = mapChatMessagesToStoredMessages([message])[0];
      const updated = [...current, stored];

      await this.redis.set(key, JSON.stringify(updated), "EX", this.ttl);
      return Result.ok();
    } catch (e: any) {
      return Result.error(new Error(`failed to add message: ${e.message}`));
    }
  }

  async addMessages(
    sessionId: string,
    nodeId: string,
    messages: BaseMessage[],
  ): Promise<Result<void, Error>> {
    try {
      const key = this.getKey(sessionId, nodeId);
      const raw = await this.redis.get(key);
      const current = raw ? JSON.parse(raw) : [];

      const filtered = messages.filter(
        (m) => !["tool", "function"].includes(m.getType()),
      );
      const stored = mapChatMessagesToStoredMessages(filtered);
      const updated = [...current, ...stored];

      await this.redis.set(key, JSON.stringify(updated), "EX", this.ttl);
      return Result.ok();
    } catch (e: any) {
      return Result.error(new Error(`failed to add messages: ${e.message}`));
    }
  }
}
