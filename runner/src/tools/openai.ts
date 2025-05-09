import { ChatOpenAI } from "@langchain/openai";
import { Result } from "typescript-result";
import { z } from "zod";
import { NodeOptions } from "../nodes/types";
import { CryptoService } from "../services/secret/crypto-service";
import { logger } from "../utils/logger";
import { OpenAICompletion, Tool, ToolOutput } from "./tool.interface";

const defaultSystemPrompt =
  "You are an AI that performs a task based on the user's request. You must respond with the output of the task.";

export class OpenAICompletionTool implements Tool<"chat-openai-as-tool"> {
  private llm: ChatOpenAI;
  readonly id: string;
  private cryptoService: CryptoService;
  private systemPrompt: string;
  readonly type = "chat-openai-as-tool";

  readonly name: string;
  readonly description: string;

  readonly schema = z.object({
    input: z.string().describe("The input for the tool"),
  });

  constructor(definition: OpenAICompletion) {
    this.cryptoService = new CryptoService();
    this.id = definition.id;
    if (!definition.config.model) {
      throw new Error("model is required");
    }

    if (!definition.config.apiKey) {
      throw new Error("apiKey is required");
    }

    const [decryptedApiKeyResult, decryptedApiKeyError] = this.cryptoService
      .decrypt(definition.config.apiKey)
      .toTuple();
    if (decryptedApiKeyError) {
      throw decryptedApiKeyError;
    }

    const apiKey = decryptedApiKeyResult;
    this.name = definition.name;
    this.description = definition.description;
    this.systemPrompt =
      definition.config.developerMessage || defaultSystemPrompt;
    this.llm = new ChatOpenAI({
      modelName: definition.config.model,
      temperature: definition.config.temperature,
      maxTokens: definition.config.maxTokens,
      openAIApiKey: apiKey,
    });
  }

  async run(
    params: z.infer<typeof this.schema>,
    options: NodeOptions,
  ): Promise<Result<ToolOutput, Error>> {
    try {
      logger.debug(
        `running ${this.name} OpenAICompletionTool: ${JSON.stringify(params)}`,
      );

      options.onEvent("TOOL_STARTED", {
        toolName: this.name,
        inputs: params,
        agentName: "default",
        nodeId: this.id,
      });

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

      options.onEvent("TOOL_COMPLETED", {
        agentName: "default",
        nodeId: this.id,
        toolName: this.name,
        inputs: params,
        output: {
          content: String(response.content),
        },
      });

      return Result.ok(String(response.content));
    } catch (error) {
      options.onEvent("TOOL_FAILED", {
        agentName: "default",
        nodeId: this.id,
        toolName: this.name,
        error: error as string,
      });
      return Result.error(new Error(`OpenAI completion failed: ${error}`));
    }
  }
}
