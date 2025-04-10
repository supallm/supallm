import { BaseMessage } from "@langchain/core/messages";
import { Result } from "typescript-result";

export type MemoryType = "local-memory" | "none";

export interface MemoryConfig {
  type: MemoryType;
  maxMessages?: number;
  keepSystemMessage?: boolean;
  ttl?: number;
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
