import { Result } from "typescript-result";
import { assertUnreachable } from "../utils/type-safety";
import { DiscordNotifierTool } from "./discord-notifier-tool";
import { HttpTool } from "./http-tool";
import { OpenAICompletionTool } from "./openai";
import { PostgresQueryTool } from "./postgres-query-tool";
import { SDKNotifierTool } from "./sdk-notifier-tool";
import {
  Discord,
  Http,
  OpenAICompletion,
  PostgresQuery,
  SDKNotifier,
  Tool,
  ToolConfig,
  ToolOptions,
} from "./tool.interface";

export class ToolRegistry {
  static create(config: ToolConfig, options: ToolOptions): Result<Tool, Error> {
    switch (config.type) {
      case "chat-openai-as-tool":
        return Result.ok(new OpenAICompletionTool(config as OpenAICompletion));
      case "discord_notifier":
        return Result.ok(new DiscordNotifierTool(config as Discord));
      case "http_request":
        return Result.ok(new HttpTool(config as Http));
      case "sdk-notifier-tool":
        return Result.ok(new SDKNotifierTool(config as SDKNotifier, options));
      case "postgres-query-tool":
        return Result.ok(
          new PostgresQueryTool(config as PostgresQuery, options),
        );
      default:
        return assertUnreachable(config);
    }
  }
}
