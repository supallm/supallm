import { Result } from "typescript-result";
import { DiscordNotifierTool } from "./discord-notifier-tool";
import { HttpTool } from "./http-tool";
import { OpenAICompletionTool } from "./openai";
import { Tool, ToolConfig } from "./tool.interface";

export class ToolRegistry {
  static create<T extends ToolConfig>(config: T): Result<Tool, Error> {
    switch (config.type) {
      case "openai_completion":
        return Result.ok(new OpenAICompletionTool(config));
      case "discord_notifier":
        return Result.ok(new DiscordNotifierTool(config));
      case "http_request":
        return Result.ok(new HttpTool(config));
      default:
        return Result.error(new Error(`tool type ${config} not found`));
    }
  }
}
