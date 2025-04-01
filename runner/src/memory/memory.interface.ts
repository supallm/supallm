import { BaseMessage } from "@langchain/core/messages";
import { Result } from "typescript-result";

export type MemoryType = "redis" | "supallm" | "none";

export interface MemoryConfig {
  type: MemoryType;
  options?: {
    ttl?: number;
    maxMessages?: number;
    [key: string]: any;
  };
}

export interface IMemory {
  getMessages(
    sessionId: string,
    nodeId: string,
  ): Promise<Result<BaseMessage[], Error>>;
  addMessages(
    sessionId: string,
    nodeId: string,
    messages: BaseMessage[],
  ): Promise<Result<void, Error>>;
}
