import { ChatOpenAI } from "@langchain/openai";
import { Result } from "typescript-result";
import { z } from "zod";
import { CryptoService } from "../services/secret/crypto-service";
import {
  OpenAICompletionConfig,
  OpenAICompletionToolParams,
  Tool,
  ToolOutput,
} from "./tool.interface";

const defaultSystemPrompt =
  "You are an AI that performs a task based on the user's request. You must respond with the output of the task.";

export class OpenAICompletionTool implements Tool<"openai_completion"> {
  private llm: ChatOpenAI;
  private cryptoService: CryptoService;
  private systemPrompt: string;
  readonly type = "openai_completion";

  readonly name: string;
  readonly description: string;

  readonly schema = z.object({
    input: z.string().describe("The input for the tool"),
  });

  constructor(config: OpenAICompletionConfig) {
    this.cryptoService = new CryptoService();

    if (!config.model) {
      throw new Error("model is required");
    }

    if (!config.apiKey) {
      throw new Error("apiKey is required");
    }

    const [decryptedApiKeyResult, decryptedApiKeyError] = this.cryptoService
      .decrypt(config.apiKey)
      .toTuple();
    if (decryptedApiKeyError) {
      throw decryptedApiKeyError;
    }

    const apiKey = decryptedApiKeyResult;
    this.name = config.name;
    this.description = config.description;
    this.systemPrompt = config.systemPrompt || defaultSystemPrompt;
    this.llm = new ChatOpenAI({
      modelName: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      openAIApiKey: apiKey,
    });
  }

  async run(
    params: OpenAICompletionToolParams,
  ): Promise<Result<ToolOutput, Error>> {
    try {
      const response = await this.llm.invoke([
        {
          role: "system",
          content: this.systemPrompt,
        },
        {
          role: "user",
          content: params.input,
        },
      ]);
      return Result.ok(String(response.content));
    } catch (error) {
      return Result.error(new Error(`OpenAI completion failed: ${error}`));
    }
  }
}
