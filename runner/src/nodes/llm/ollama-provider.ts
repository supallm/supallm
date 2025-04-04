import { BaseMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
import { Result } from "typescript-result";
import { CryptoService } from "../../services/secret/crypto-service";
import {
  INode,
  NodeDefinition,
  NodeInput,
  NodeOptions,
  NodeOutput,
  NodeType,
} from "../types";
import { GenerateResult, LLMOptions, LLMUtils } from "./llm-utils";
import { ModelNotFoundError, ProviderAPIError } from "./llm.errors";

interface OllamaOptions extends LLMOptions {
  temperature: number;
  maxTokens?: number;
  streaming: boolean;
  systemPrompt?: string;
  baseUrl: string;
  format?: "json";
}

export class OllamaProvider implements INode {
  type: NodeType = "chat-ollama";
  private utils: LLMUtils;

  constructor() {
    this.utils = new LLMUtils(new CryptoService());
  }

  private prepareOllamaOptions(
    config: LLMOptions,
    definition: NodeDefinition,
  ): Result<OllamaOptions, Error> {
    if (!definition.config["baseUrl"]) {
      return Result.error(new Error("baseUrl is required"));
    }

    return Result.ok({
      ...config,
      baseUrl: definition.config["baseUrl"],
      temperature: definition.config["temperature"],
      maxTokens: definition.config["maxTokens"],
      streaming: definition.config["streaming"],
    });
  }

  async execute(
    nodeId: string,
    definition: NodeDefinition,
    inputs: NodeInput,
    options: NodeOptions,
  ): Promise<Result<NodeOutput, Error>> {
    const validateAndPrepare = await this.utils.validateAndPrepare(
      definition,
      inputs,
    );
    const [validateAndPrepareResult, validateAndPrepareError] =
      validateAndPrepare.toTuple();
    if (validateAndPrepareError) {
      return Result.error(validateAndPrepareError);
    }

    const { resolvedInputs, resolvedOutputs, config } =
      validateAndPrepareResult;
    const [ollamaOptions, ollamaOptionsError] = this.prepareOllamaOptions(
      config,
      definition,
    ).toTuple();
    if (ollamaOptionsError) {
      return Result.error(ollamaOptionsError);
    }

    const prepareMessages = await this.utils.prepareMessages(
      ollamaOptions.systemPrompt,
      resolvedInputs,
    );
    const [prepareMessagesResult, prepareMessagesError] =
      prepareMessages.toTuple();
    if (prepareMessagesError) {
      return Result.error(prepareMessagesError);
    }

    const generate = await this.generateResponse(
      prepareMessagesResult,
      ollamaOptions,
    );
    const [generateResult, generateError] = generate.toTuple();
    if (generateError) {
      return Result.error(generateError);
    }

    let fullResponse = "";
    const outputField = resolvedOutputs.result_key;

    for await (const data of generateResult) {
      const chunkContent = LLMUtils.formatChunkContent(data);

      if (chunkContent) {
        if (outputField) {
          await options.onNodeResult(
            nodeId,
            outputField,
            chunkContent,
            resolvedOutputs.type,
          );
        }
        fullResponse += chunkContent;
      }
    }

    return Result.ok({ response: fullResponse });
  }

  private async generateResponse(
    messages: BaseMessage[],
    options: OllamaOptions,
  ): Promise<GenerateResult> {
    try {
      const [model, modelError] = this.createModel(options).toTuple();
      if (modelError) {
        return Result.error(modelError);
      }

      if (options.streaming) {
        return LLMUtils.handleStreamingResponse(model, messages, (m, msgs) =>
          m.stream(msgs),
        );
      } else {
        return LLMUtils.handleNonStreamingResponse(model, messages, (m, msgs) =>
          m.invoke(msgs),
        );
      }
    } catch (error) {
      return this.mapApiError(error, options.model);
    }
  }

  private createModel(
    options: OllamaOptions,
  ): Result<ChatOllama, ModelNotFoundError | ProviderAPIError> {
    try {
      return Result.ok(
        new ChatOllama({
          model: options.model,
          temperature: options.temperature,
          baseUrl: options.baseUrl,
          streaming: options.streaming,
        }),
      );
    } catch (error) {
      return Result.error(
        new ProviderAPIError(`failed to initialize Ollama model`),
      );
    }
  }

  private mapApiError(error: unknown, model?: string): GenerateResult {
    return LLMUtils.mapProviderError(error, model, "ollama");
  }
}
