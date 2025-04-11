import { Result } from "typescript-result";
import { z } from "zod";
import { NodeOptions } from "../nodes/types";
import { CryptoService } from "../services/secret/crypto-service";
import { logger } from "../utils/logger";
import { SonarSearch, Tool, ToolOutput } from "./tool.interface";

const defaultDescription =
  "Generate chat completions using Perplexity's Sonar model.";
const defaultName = "sonar-search";
const API_ENDPOINT = "https://api.perplexity.ai/chat/completions";

export class SonarSearchTool implements Tool<"sonar-search-tool"> {
  readonly type = "sonar-search-tool";
  readonly id: string;
  readonly name: string;
  readonly description: string;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly temperature: number | undefined;
  private readonly maxTokens: number | undefined;
  private readonly searchDomainFilter?: string[];
  private readonly searchRecencyFilter?: string;
  private readonly returnRelatedQuestions: boolean;

  readonly schema = z.object({
    messages: z
      .array(
        z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string(),
        }),
      )
      .describe("The conversation messages"),
  });

  constructor(definition: SonarSearch) {
    const cryptoService = new CryptoService();
    if (!definition.config.apiKey) {
      throw new Error("Perplexity API key is required");
    }

    if (!definition.config.model) {
      throw new Error("Perplexity model is required");
    }

    const [decryptedApiKeyResult, decryptedApiKeyError] = cryptoService
      .decrypt(definition.config.apiKey)
      .toTuple();
    if (decryptedApiKeyError) {
      throw new Error("Perplexity API key is required");
    }

    this.id = definition.id;
    this.name = definition.name || defaultName;
    this.description = definition.description || defaultDescription;
    this.apiKey = decryptedApiKeyResult;
    this.model = definition.config.model;
    this.temperature = definition.config.temperature;
    this.maxTokens = definition.config.maxTokens;
    this.searchDomainFilter = definition.config.searchDomainFilter;
    this.searchRecencyFilter = definition.config.searchRecencyFilter;
    this.returnRelatedQuestions =
      definition.config.returnRelatedQuestions ?? false;
  }

  async run(
    params: z.infer<typeof this.schema>,
    options: NodeOptions,
  ): Promise<Result<ToolOutput, Error>> {
    try {
      logger.debug(
        `running ${this.name} SonarChatTool: ${JSON.stringify(params)}`,
      );

      options.onEvent("TOOL_STARTED", {
        toolName: this.name,
        inputs: params,
        agentName: "default",
        nodeId: this.id,
      });

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: params.messages,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          stream: false,
          search_domain_filter: this.searchDomainFilter,
          return_images: false,
          return_related_questions: this.returnRelatedQuestions,
          search_recency_filter: this.searchRecencyFilter,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Perplexity API request failed: ${JSON.stringify(error)}`,
        );
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
        new Error(`Failed to execute Sonar chat completion: ${error}`),
      );
    }
  }
}
