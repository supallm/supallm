import { ChatAnthropic } from "@langchain/anthropic";
import { BaseMessage } from "@langchain/core/messages";
import { Result } from "typescript-result";
import { CryptoService } from "../../services/secret/crypto-service";
import { logger } from "../../utils/logger";
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

interface AnthropicOptions extends LLMOptions {
  temperature: number;
  maxTokenToSample?: number;
  outputMode: "text-stream" | "text";
  systemPrompt?: string;
}

export class AnthropicProvider implements INode {
  type: NodeType = "chat-anthropic";
  private utils: LLMUtils;

  constructor() {
    this.utils = new LLMUtils(new CryptoService());
  }

  private prepareAnthropicOptions(
    config: LLMOptions,
    definition: NodeDefinition,
  ): Result<AnthropicOptions, Error> {
    return Result.ok({
      ...config,
      temperature: definition.config["temperature"],
      maxTokenToSample: definition.config["maxTokenToSample"],
      outputMode: definition.config["outputMode"],
      systemPrompt: definition.config["systemPrompt"],
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
    const [anthropicOptions, anthropicOptionsError] =
      this.prepareAnthropicOptions(config, definition).toTuple();
    if (anthropicOptionsError) {
      return Result.error(anthropicOptionsError);
    }

    const prepareMessages = await this.utils.prepareMessages(
      anthropicOptions.systemPrompt,
      resolvedInputs,
    );
    const [prepareMessagesResult, prepareMessagesError] =
      prepareMessages.toTuple();
    if (prepareMessagesError) {
      return Result.error(prepareMessagesError);
    }

    const generate = await this.generateResponse(
      prepareMessagesResult,
      anthropicOptions,
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
          await options.onEvent("NODE_RESULT", {
            nodeId,
            outputField,
            data: chunkContent,
            ioType: resolvedOutputs.type,
          });
        }
        fullResponse += chunkContent;
      }
    }

    return Result.ok({ response: fullResponse });
  }

  private async generateResponse(
    messages: BaseMessage[],
    options: AnthropicOptions,
  ): Promise<GenerateResult> {
    try {
      const [model, modelError] = this.createModel(options).toTuple();
      if (modelError) {
        return Result.error(modelError);
      }

      if (options.outputMode === "text-stream") {
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
    options: AnthropicOptions,
  ): Result<ChatAnthropic, ModelNotFoundError | ProviderAPIError> {
    logger.info(`creating Anthropic model ${JSON.stringify(options)}`);
    try {
      return Result.ok(
        new ChatAnthropic({
          modelName: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokenToSample,
          anthropicApiKey: options.decryptedApiKey,
          streaming: options.outputMode === "text-stream",
        }),
      );
    } catch (error) {
      return Result.error(
        new ProviderAPIError(`failed to initialize Anthropic model`),
      );
    }
  }

  private mapApiError(error: unknown, model?: string): GenerateResult {
    return LLMUtils.mapProviderError(error, model, "anthropic");
  }
}
