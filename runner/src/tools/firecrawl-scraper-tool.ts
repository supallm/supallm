import FirecrawlApp from "@mendable/firecrawl-js";
import { Result } from "typescript-result";
import { z } from "zod";
import { NodeOptions } from "../nodes/types";
import { CryptoService } from "../services/secret/crypto-service";
import { logger } from "../utils/logger";
import { FirecrawlScraper, Tool, ToolOutput } from "./tool.interface";

const defaultName = "firecrawl-scraper";

export class FirecrawlScraperTool implements Tool<"firecrawl-scraper-tool"> {
  readonly type = "firecrawl-scraper-tool";
  readonly id: string;
  readonly name: string;
  readonly description: string;
  private firecrawl: FirecrawlApp;
  readonly schema: z.ZodSchema;
  private readonly definition: FirecrawlScraper;

  constructor(definition: FirecrawlScraper) {
    const cryptoService = new CryptoService();

    if (!definition.config.apiKey) {
      throw new Error("Firecrawl API key is required");
    }

    const [decryptedApiKeyResult, decryptedApiKeyError] = cryptoService
      .decrypt(definition.config.apiKey)
      .toTuple();
    if (decryptedApiKeyError) {
      throw new Error("Firecrawl API key failed to decrypt");
    }

    let defaultDescription = `This tool allows to scrape data from an URL given in the parameters. You can decide what URL to scrape based on the context.`;

    if (definition.config.url) {
      defaultDescription = `This tool allows to scrape data available at ${definition.config.url}. No parameters are required for this tool since the user already provided the URL.`;
    }

    this.definition = definition;
    this.id = definition.id;
    this.name = definition.name || defaultName;
    this.description = definition.description || defaultDescription;
    this.firecrawl = new FirecrawlApp({ apiKey: decryptedApiKeyResult });

    if (!definition.config.url?.length) {
      this.schema = z.object({
        url: z
          .string()
          .describe("This is the URL to scrape data from. Required."),
      });
    } else {
      this.schema = z
        .object({})
        .describe("No parameters should be provided for this tool.");
    }
  }

  async run(
    params: z.infer<typeof this.schema>,
    options: NodeOptions,
  ): Promise<Result<ToolOutput, Error>> {
    try {
      logger.debug(
        `running ${this.name} FirecrawlScraperTool: ${JSON.stringify(params)}`,
      );

      options.onEvent("TOOL_STARTED", {
        toolName: this.name,
        inputs: params,
        agentName: "default",
        nodeId: this.id,
      });

      console.log("Params", params);

      const url = !!this.definition.config.url?.length
        ? this.definition.config.url
        : params.url;

      if (!url) {
        throw new Error("URL is required and was not provided to the tool.");
      }

      const parameters = {
        formats: this.definition.config.formats ?? [],
        onlyMainContent: this.definition.config.onlyMainContent ?? undefined,
        mobile: this.definition.config.mobile ?? undefined,
        timeout: this.definition.config.timeout ?? undefined,
        removeBase64Images:
          this.definition.config.removeBase64Images ?? undefined,
        blockAds: this.definition.config.blockAds ?? undefined,
        proxy: this.definition.config.proxy ?? undefined,
        waitFor: this.definition.config.waitFor ?? undefined,
        jsonOptions: this.definition.config.jsonOptionsPrompt
          ? {
              prompt: this.definition.config.jsonOptionsPrompt ?? undefined,
            }
          : undefined,
        location: {
          country: this.definition.config.country ?? undefined,
        },
      };

      console.log("Parameters", parameters);

      const result = await this.firecrawl.scrapeUrl(url, parameters);

      options.onEvent("TOOL_COMPLETED", {
        agentName: "default",
        nodeId: this.id,
        toolName: this.name,
        inputs: params,
        output: result,
      });

      return Result.ok(JSON.stringify(result));
    } catch (error: any) {
      options.onEvent("TOOL_FAILED", {
        agentName: "default",
        nodeId: this.id,
        toolName: this.name,
        error: error as string,
      });
      console.error(error);
      return Result.error(
        new Error(`Failed to execute Firecrawl Scraper: ${error?.message}`),
      );
    }
  }
}
