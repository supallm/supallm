import { Result } from "typescript-result";
import { z } from "zod";
import { NodeOptions } from "../nodes/types";
import { CryptoService } from "../services/secret/crypto-service";
import { logger } from "../utils/logger";
import { BraveSearch, Tool, ToolOutput } from "./tool.interface";

const defaultDescription =
  "Execute web searches using the Brave Search API to get relevant search results.";
const defaultName = "brave-search";
const defaultEndpoint = "https://api.search.brave.com/res/v1/web/search";

export class BraveSearchTool implements Tool<"brave-search-tool"> {
  readonly type = "brave-search-tool";
  private cryptoService: CryptoService;
  readonly id: string;
  readonly name: string;
  readonly description: string;
  private apiKey: string;
  private endpoint: string;

  readonly schema = z.object({
    query: z.string().describe("The search query to execute"),
    count: z
      .number()
      .optional()
      .describe("Number of results to return (max 20)"),
    offset: z.number().optional().describe("Offset for pagination"),
  });

  constructor(definition: BraveSearch) {
    this.cryptoService = new CryptoService();

    if (!definition.config.apiKey) {
      throw new Error("Brave Search API key is required");
    }

    const [decryptedApiKeyResult, decryptedApiKeyError] = this.cryptoService
      .decrypt(definition.config.apiKey)
      .toTuple();
    if (decryptedApiKeyError) {
      throw new Error("Brave Search API key is required");
    }

    this.id = definition.id;
    this.name = definition.name || defaultName;
    this.description = definition.description || defaultDescription;
    this.apiKey = decryptedApiKeyResult;
    this.endpoint = definition.config.endpoint || defaultEndpoint;
  }

  async run(
    params: z.infer<typeof this.schema>,
    options: NodeOptions,
  ): Promise<Result<ToolOutput, Error>> {
    try {
      logger.debug(
        `running ${this.name} BraveSearchTool: ${JSON.stringify(params)}`,
      );

      options.onEvent("TOOL_STARTED", {
        toolName: this.name,
        inputs: params,
        agentName: "default",
        nodeId: this.id,
      });

      const searchParams = new URLSearchParams({
        q: params.query,
        ...(params.count && { count: params.count.toString() }),
        ...(params.offset && { offset: params.offset.toString() }),
      });

      const response = await fetch(
        `${this.endpoint}?${searchParams.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": this.apiKey,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Brave Search request failed: ${response.statusText}`);
      }

      const result = await response.json();

      options.onEvent("TOOL_COMPLETED", {
        agentName: "default",
        nodeId: this.id,
        toolName: this.name,
        inputs: params,
        output: result,
      });

      return Result.ok(JSON.stringify(result));
    } catch (error) {
      options.onEvent("TOOL_FAILED", {
        agentName: "default",
        nodeId: this.id,
        toolName: this.name,
        error: error as string,
      });
      return Result.error(
        new Error(`Failed to execute Brave Search: ${error}`),
      );
    }
  }
}
