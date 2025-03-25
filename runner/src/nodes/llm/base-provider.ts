import { Result } from "typescript-result";
import { LLMExecutionError } from "./llm.errors";

export interface LLMOptions {
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
}

export type GenerateResult = Result<
  AsyncIterable<{ content: string }>,
  LLMExecutionError
>;
