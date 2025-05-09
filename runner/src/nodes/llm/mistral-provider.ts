import { BaseMessage } from "@langchain/core/messages";
import { ChatMistralAI } from "@langchain/mistralai";
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

interface MistralOptions extends LLMOptions {
  temperature: number;
  maxTokens?: number;
  outputMode: "text-stream" | "text";
}

export class MistralProvider implements INode {
  type: NodeType = "chat-mistral";
  private utils: LLMUtils;

  constructor() {
    this.utils = new LLMUtils(new CryptoService());
  }

  private prepareMistralOptions(
    config: LLMOptions,
    definition: NodeDefinition,
  ): Result<MistralOptions, Error> {
    return Result.ok({
      ...config,
      temperature: definition.config["temperature"],
      maxTokens: definition.config["maxTokens"],
      outputMode: definition.config["outputMode"],
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
    const [mistralOptions, mistralOptionsError] = this.prepareMistralOptions(
      config,
      definition,
    ).toTuple();
    if (mistralOptionsError) {
      return Result.error(mistralOptionsError);
    }

    const prepareMessages = await this.utils.prepareMessages(
      undefined,
      resolvedInputs,
    );
    const [prepareMessagesResult, prepareMessagesError] =
      prepareMessages.toTuple();
    if (prepareMessagesError) {
      return Result.error(prepareMessagesError);
    }

    const generate = await this.generateResponse(
      prepareMessagesResult,
      mistralOptions,
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
    options: MistralOptions,
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
    options: MistralOptions,
  ): Result<ChatMistralAI, ModelNotFoundError | ProviderAPIError> {
    try {
      return Result.ok(
        new ChatMistralAI({
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          apiKey: options.decryptedApiKey,
          streaming: options.outputMode === "text-stream",
        }),
      );
    } catch (error) {
      return Result.error(
        new ProviderAPIError(`failed to initialize Mistral model`),
      );
    }
  }

  private mapApiError(error: unknown, model?: string): GenerateResult {
    return LLMUtils.mapProviderError(error, model, "mistral");
  }
}
