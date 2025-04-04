import { Result } from "typescript-result";
import { DiscordNotifierTool } from "./discord-notifier-tool";
import { HttpTool } from "./http-tool";
import { OpenAICompletionTool } from "./openai";
import { SDKNotifierTool } from "./sdk-notifier-tool";
import { Tool, ToolConfig, ToolOptions } from "./tool.interface";

export class ToolRegistry {
  static create<T extends ToolConfig>(
    config: T,
    options: ToolOptions,
  ): Result<Tool, Error> {
    switch (config.type) {
      case "chat-openai-as-tool":
        return Result.ok(new OpenAICompletionTool(config));
      case "discord_notifier":
        return Result.ok(new DiscordNotifierTool(config));
      case "http_request":
        return Result.ok(new HttpTool(config));
      case "sdk-notifier-tool":
        return Result.ok(new SDKNotifierTool(config, options));
      default:
        return Result.error(new Error(`tool type ${config} not found`));
    }
  }
}
