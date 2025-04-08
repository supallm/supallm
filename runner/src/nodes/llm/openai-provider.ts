import { BaseMessage } from "@langchain/core/messages";
import { ChatOpenAI, OpenAI } from "@langchain/openai";
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
interface OpenAIOptions extends LLMOptions {
  temperature: number;
  maxTokens?: number;
  outputMode: "text-stream" | "text";
  systemPrompt?: string;
}

export class OpenAIProvider implements INode {
  type: NodeType = "chat-openai";
  private utils: LLMUtils;

  constructor() {
    this.utils = new LLMUtils(new CryptoService());
  }

  private prepareOpenAIOptions(
    config: LLMOptions,
    definition: NodeDefinition,
  ): Result<OpenAIOptions, Error> {
    return Result.ok({
      ...config,
      temperature: definition.config["temperature"],
      maxTokens: definition.config["maxCompletionTokens"],
      outputMode: definition.config["outputMode"],
      systemPrompt: definition.config["developerMessage"],
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
    const [openaiOptions, openaiOptionsError] = this.prepareOpenAIOptions(
      config,
      definition,
    ).toTuple();
    if (openaiOptionsError) {
      return Result.error(openaiOptionsError);
    }

    const prepareMessages = await this.utils.prepareMessages(
      openaiOptions.systemPrompt,
      resolvedInputs,
    );
    const [prepareMessagesResult, prepareMessagesError] =
      prepareMessages.toTuple();
    if (prepareMessagesError) {
      return Result.error(prepareMessagesError);
    }

    const generate = await this.generateResponse(
      prepareMessagesResult,
      openaiOptions,
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
    options: OpenAIOptions,
  ): Promise<GenerateResult> {
    try {
      logger.info(`options ${JSON.stringify(options)}`);
      const [model, modelError] = this.createModel(options).toTuple();
      if (modelError) {
        return Result.error(modelError);
      }

      if (model instanceof ChatOpenAI && options.outputMode === "text-stream") {
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
    options: OpenAIOptions,
  ): Result<OpenAI | ChatOpenAI, ModelNotFoundError | ProviderAPIError> {
    try {
      const isChatModel = this.isChatModel(options.model);
      if (isChatModel) {
        return Result.ok(
          new ChatOpenAI({
            modelName: options.model,
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            openAIApiKey: options.decryptedApiKey,
            streaming: options.outputMode === "text-stream",
          }),
        );
      } else {
        return Result.ok(
          new OpenAI({
            modelName: options.model,
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            openAIApiKey: options.decryptedApiKey,
            streaming: options.outputMode === "text-stream",
          }),
        );
      }
    } catch (error) {
      return Result.error(
        new ProviderAPIError(`failed to initialize openai model`),
      );
    }
  }

  private mapApiError(error: unknown, model?: string): GenerateResult {
    return LLMUtils.mapProviderError(error, model, "openai");
  }

  private isChatModel(model: string): boolean {
    const chatModels = [
      "gpt-4",
      "gpt-4-turbo",
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-3.5-turbo",
      "gpt-3.5",
      "gpt-35-turbo",
    ];

    return chatModels.some((chatModel) =>
      model.toLowerCase().startsWith(chatModel.toLowerCase()),
    );
  }
}
