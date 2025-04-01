import { Result } from "typescript-result";
import { z } from "zod";
import { NodeResultCallback } from "../nodes/types";

export type ToolOptions = {
  nodeId: string;
  sessionId: string;
  onNodeResult: NodeResultCallback;
};

export type ToolType =
  | "openai_completion"
  | "discord_notifier"
  | "http_request"
  | "sdk_notifier";

type BaseConfig = {
  name: string;
  description: string;
  type: ToolType;
};

export interface DiscordConfig extends BaseConfig {
  type: "discord_notifier";
  webhookUrl: string;
}

export interface HttpConfig extends BaseConfig {
  type: "http_request";
  headers: Record<string, string>;
  url: string;
}

export interface OpenAICompletionConfig extends BaseConfig {
  type: "openai_completion";
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface SDKNotifierConfig extends BaseConfig {
  type: "sdk_notifier";
  output_field: string;
  schema: z.ZodSchema;
}

export type ToolConfig =
  | DiscordConfig
  | HttpConfig
  | OpenAICompletionConfig
  | SDKNotifierConfig;

export type ToolOutput = string;

export interface Tool<T extends ToolType = ToolType> {
  readonly type: T;
  readonly name: string;
  readonly description: string;
  readonly schema: z.ZodSchema;
  run(params: any): Promise<Result<ToolOutput, Error>>;
}
