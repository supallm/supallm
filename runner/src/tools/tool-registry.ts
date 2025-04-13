import { Result } from "typescript-result";
import { assertUnreachable } from "../utils/type-safety";
import { BraveSearchTool } from "./brave-search-tool";
import { DiscordNotifierTool } from "./discord-notifier-tool";
import { FirecrawlScraperTool } from "./firecrawl-scraper-tool";
import { HttpTool } from "./http-tool";
import { OpenAICompletionTool } from "./openai";
import { PostgresQueryTool } from "./postgres-query-tool";
import { SDKNotifierTool } from "./sdk-notifier-tool";
import { SonarSearchTool } from "./sonar-chat-tool";
import {
  BraveSearch,
  Discord,
  FirecrawlScraper,
  Http,
  OpenAICompletion,
  PostgresQuery,
  SDKNotifier,
  SonarSearch,
  Tool,
  ToolConfig,
} from "./tool.interface";

export class ToolRegistry {
  static create(config: ToolConfig): Result<Tool, Error> {
    switch (config.type) {
      case "chat-openai-as-tool":
        return Result.ok(new OpenAICompletionTool(config as OpenAICompletion));
      case "discord_notifier":
        return Result.ok(new DiscordNotifierTool(config as Discord));
      case "http_request":
        return Result.ok(new HttpTool(config as Http));
      case "sdk-notifier-tool":
        return Result.ok(new SDKNotifierTool(config as SDKNotifier));
      case "postgres-query-tool":
        return Result.ok(new PostgresQueryTool(config as PostgresQuery));
      case "brave-search-tool":
        return Result.ok(new BraveSearchTool(config as BraveSearch));
      case "sonar-search-tool":
        return Result.ok(new SonarSearchTool(config as SonarSearch));
      case "firecrawl-scraper-tool":
        return Result.ok(new FirecrawlScraperTool(config as FirecrawlScraper));
      default:
        return assertUnreachable(config);
    }
  }
}
