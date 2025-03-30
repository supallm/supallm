import { BaseMessage } from "@langchain/core/messages";
import { Result } from "typescript-result";
import { z } from "zod";

export type ToolType = "sentiment" | "discord_notifier";

export type MemoryToolParams = {
  sessionId: string;
  nodeId: string;
  messages?: BaseMessage[];
};

export type CalculatorToolParams = {
  input: string;
};

export type SentimentToolParams = {
  input: string;
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

export type MemoryToolOutput = BaseMessage[] | null;
export type CalculatorToolOutput = string;
export type SentimentToolOutput = string;
export type DiscordNotifierToolOutput = string;

export type Params =
  | MemoryToolParams
  | CalculatorToolParams
  | SentimentToolParams
  | DiscordNotifierToolParams;

export type RunOutput =
  | MemoryToolOutput
  | CalculatorToolOutput
  | SentimentToolOutput
  | DiscordNotifierToolOutput;

export interface ToolConfig {
  name: string;
  type: ToolType;
  description: string;
  instructions?: string;
  responseFormat?: {
    type: string;
  };
  [key: string]: any;
}

export interface Tool<T = RunOutput> {
  name: string;
  type: ToolType;
  description: string;
  schema: z.ZodSchema;
  run(params: Params): Promise<Result<T, Error>>;
}
