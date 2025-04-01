import { Result } from "typescript-result";
import { z } from "zod";

export type ToolType =
  | "openai_completion"
  | "discord_notifier"
  | "http_request";

export type OpenAICompletionToolParams = {
  input: string;
};

export type HttpToolParams = {
  method: string;
  body?: string;
};

export interface DiscordNotifierToolParams {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds?: {
    author?: {
      name?: string;
      url?: string;
      icon_url?: string;
    };
    title?: string;
    url?: string;
    description?: string;
    color?: number;
    fields?: {
      name: string;
      value: string;
      inline?: boolean;
    }[];
    thumbnail?: {
      url: string;
    };
    image?: {
      url: string;
    };
    footer?: {
      text: string;
      icon_url?: string;
    };
    timestamp?: string;
  }[];
}

type BaseConfig = {
  name: string;
  description: string;
  responseFormat?: z.ZodSchema;
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

export type ToolConfig = DiscordConfig | HttpConfig | OpenAICompletionConfig;

export type ToolParamsMap = {
  discord_notifier: DiscordNotifierToolParams;
  http_request: HttpToolParams;
  openai_completion: OpenAICompletionToolParams;
};

export type ToolOutput = string;

export interface Tool<T extends ToolType = ToolType> {
  readonly type: T;
  readonly name: string;
  readonly description: string;
  readonly schema: z.ZodSchema;
  run(params: ToolParamsMap[T]): Promise<Result<ToolOutput, Error>>;
}
