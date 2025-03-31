import { Result } from "typescript-result";
import { DiscordNotifierTool } from "./discord-notifier-tool";
import { HttpTool } from "./http-tool";
import { SentimentTool } from "./sentiment-tool";
import { Tool, ToolConfig, ToolType } from "./tool.interface";

export class ToolRegistry {
  static create(type: ToolType, config: ToolConfig): Result<Tool, Error> {
    switch (type) {
      case "sentiment":
        return Result.ok(new SentimentTool(config));
      case "discord_notifier":
        return Result.ok(new DiscordNotifierTool(config));
      case "http":
        return Result.ok(new HttpTool(config));
      default:
        return Result.error(new Error(`tool type ${type} not found`));
    }
  }
}
