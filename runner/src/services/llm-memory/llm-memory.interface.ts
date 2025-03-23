import { BaseMessage } from "@langchain/core/messages";
import { Result } from "typescript-result";

export interface LLMMemoryService {
  getMessages(
    sessionId: string,
    nodeId: string,
  ): Promise<Result<BaseMessage[], Error>>;
  addMessage(
    sessionId: string,
    nodeId: string,
    message: BaseMessage,
  ): Promise<Result<void, Error>>;
  addMessages(
    sessionId: string,
    nodeId: string,
    messages: BaseMessage[],
  ): Promise<Result<void, Error>>;
}
