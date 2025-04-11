import { Result } from "typescript-result";
import { z } from "zod";
import { NodeOptions } from "../nodes/types";

export type ToolOptions = {
  nodeId: string;
  sessionId: string;
  nodeOptions: NodeOptions;
};

export type ToolType =
  | "chat-openai-as-tool"
  | "discord_notifier"
  | "http_request"
  | "sdk-notifier-tool"
  | "postgres-query-tool"
  | "brave-search-tool"
  | "sonar-search-tool";

type Base = {
  id: string;
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
    developerMessage?: string;
  };
}

export interface SDKNotifier extends Base {
  type: "sdk-notifier-tool";
  config: {
    outputFieldName: string;
    outputDescription: string;
  };
}

export interface PostgresQuery extends Base {
  type: "postgres-query-tool";
  config: {
    query: string;
    apiKey: string;
    variables: { name: string; description: string }[];
  };
}

export interface BraveSearch extends Base {
  type: "brave-search-tool";
  config: {
    apiKey: string;
    endpoint?: string;
  };
}

export interface SonarSearch extends Base {
  type: "sonar-search-tool";
  config: {
    apiKey: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
    searchDomainFilter?: string[];
    searchRecencyFilter?: string;
    returnRelatedQuestions?: boolean;
  };
}

export type ToolConfig =
  | Discord
  | Http
  | OpenAICompletion
  | SDKNotifier
  | PostgresQuery
  | BraveSearch
  | SonarSearch;

export type ToolOutput = string;

export interface Tool<T extends ToolType = ToolType> {
  readonly id: string;
  readonly type: T;
  readonly name: string;
  readonly description: string;
  readonly schema: z.ZodSchema;
  run(params: any, options: NodeOptions): Promise<Result<ToolOutput, Error>>;
}
