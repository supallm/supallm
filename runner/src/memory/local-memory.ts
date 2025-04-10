import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import Redis from "ioredis";
import { BaseMemory } from "langchain/memory";
import { Result } from "typescript-result";
import config, { dbRedis } from "../utils/config";
import { logger } from "../utils/logger";
import { IMemory } from "./memory.interface";

interface ConversationTurn {
  input: string;
  output: string;
  timestamp: number;
}

export class LocalMemory extends BaseMemory implements IMemory {
  private readonly redis: Redis;
  private readonly ttl: number;
  private readonly keyPrefix = "history"; // history:<sessionId>:<nodeId>

  constructor(ttl: number = 3600) {
    // Default 1 hour TTL
    super();
    this.redis = this.initializeRedisClient();
    this.ttl = ttl;
  }

  private initializeRedisClient(): Redis {
    const redisOptions = {
      family: 0,
      db: dbRedis.LOCAL_MEMORY,
      password: config.redis.password,
      retryStrategy: (times: number) => {
        return Math.min(times * 100, 3000);
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

      const history: ConversationTurn[] = JSON.parse(raw);

      // Convert history to messages format
      const messages: BaseMessage[] = [];
      for (const turn of history) {
        messages.push(new HumanMessage(turn.input), new AIMessage(turn.output));
      }

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
      // Only store completed conversation turns (human -> ai pairs without tool calls)
      if (messages.length < 2) return Result.ok();

      const lastMessage = messages[messages.length - 1];
      const secondLastMessage = messages[messages.length - 2];

      // Only store if it's a complete human -> AI interaction without tool calls
      if (
        lastMessage instanceof AIMessage &&
        secondLastMessage instanceof HumanMessage &&
        !lastMessage.additional_kwargs?.tool_calls
      ) {
        const key = this.getKey(sessionId, nodeId);
        const raw = await this.redis.get(key);
        const history: ConversationTurn[] = raw ? JSON.parse(raw) : [];

        history.push({
          input: secondLastMessage.content.toString(),
          output: lastMessage.content.toString(),
          timestamp: Date.now(),
        });

        await this.redis.set(key, JSON.stringify(history), "EX", this.ttl);
      }

      return Result.ok();
    } catch (e: any) {
      return Result.error(new Error(`failed to add messages: ${e.message}`));
    }
  }

  // Required methods for LangChain BaseMemory
  get memoryKeys(): string[] {
    return ["chat_history"];
  }

  async loadMemoryVariables(values: {
    sessionId: string;
    nodeId: string;
  }): Promise<Record<string, any>> {
    const [messages] = (
      await this.getMessages(values.sessionId, values.nodeId)
    ).toTuple();
    return {
      chat_history: messages || [],
    };
  }

  async saveContext(
    inputValues: { sessionId: string; nodeId: string; input?: string },
    outputValues: { output?: string },
  ): Promise<void> {
    const sessionId = inputValues.sessionId;
    const nodeId = inputValues.nodeId;

    if (!sessionId || !nodeId) {
      logger.warn("Missing sessionId or nodeId in saveContext");
      return;
    }

    if (inputValues.input && outputValues.output) {
      await this.addMessages(sessionId, nodeId, [
        new HumanMessage(inputValues.input),
        new AIMessage(outputValues.output),
      ]);
    }
  }
}
