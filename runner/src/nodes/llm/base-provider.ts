import { BaseMessage } from "@langchain/core/messages";
import { LLMResult } from "./llm.errors";

export interface LLMOptions {
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
}

export type GenerateResult = AsyncIterable<{ content: string }>;

export interface BaseLLMProvider {
  generate(
    messages: BaseMessage[],
    options: LLMOptions,
  ): Promise<LLMResult<GenerateResult>>;
}
