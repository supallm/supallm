import {
  BaseMessage,
  mapChatMessagesToStoredMessages,
  mapStoredMessagesToChatMessages,
} from "@langchain/core/messages";
import Redis from "ioredis";
import { Result } from "typescript-result";
import config from "../utils/config";
import { logger } from "../utils/logger";
import { IMemory } from "./memory.interface";

const SUPALLM_MEMORY_DB = 3;

export class SupallmMemory implements IMemory {
  private readonly redis: Redis;
  private readonly ttl: number;
  private readonly keyPrefix = "memory"; // memory:<sessionId>:<nodeId>

  constructor(ttl: number = 3600) {
    this.redis = this.initializeRedisClient();
    this.ttl = ttl;
  }

  private initializeRedisClient(): Redis {
    const redisOptions = {
      db: SUPALLM_MEMORY_DB,
      password: config.redis.password,
      retryStrategy: (times: number) => {
        return Math.min(times * 100, 3000); // retry with an increasing delay
      },
      maxRetriesPerRequest: 3,
    };
    const redis = new Redis(config.redis.url, redisOptions);

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
