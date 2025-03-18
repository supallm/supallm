import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export interface LLMOptions {
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
}

export interface BaseLLMProvider {
  generate(
    messages: (SystemMessage | HumanMessage)[],
    options: LLMOptions
  ): Promise<AsyncIterable<{ content: string }>>;
}
