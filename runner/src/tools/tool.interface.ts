import { Result } from "typescript-result";
import { z } from "zod";
import { AgentNotificationCallback } from "../nodes/types";

export type ToolOptions = {
  nodeId: string;
  sessionId: string;
  onAgentNotification: AgentNotificationCallback;
};

export type ToolType =
  | "chat-openai-as-tool"
  | "discord_notifier"
  | "http_request"
  | "sdk-notifier-tool";

type Base = {
  name: string;
  description: string;
  type: ToolType;
  config: Record<string, any>;
};

export interface Discord extends Base {
  type: "discord_notifier";
  config: {
    webhookUrl: string;
  };
}

export interface Http extends Base {
  type: "http_request";
  config: {
    headers: Record<string, string>;
    url: string;
  };
}

export interface OpenAICompletion extends Base {
  type: "chat-openai-as-tool";
  config: {
    model: string;
    apiKey: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  };
}

export interface SDKNotifier extends Base {
  type: "sdk-notifier-tool";
  config: {
    outputFieldName: string;
    outputDescription: string;
  };
}

export type ToolConfig = Discord | Http | OpenAICompletion | SDKNotifier;

export type ToolOutput = string;

export interface Tool<T extends ToolType = ToolType> {
  readonly type: T;
  readonly name: string;
  readonly description: string;
  readonly schema: z.ZodSchema;
  run(params: any): Promise<Result<ToolOutput, Error>>;
}
