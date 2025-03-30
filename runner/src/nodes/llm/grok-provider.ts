import { BaseMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
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

interface GrokOptions extends LLMOptions {
  temperature: number;
  maxTokens?: number;
  streaming: boolean;
  systemPrompt?: string;
}

export class GrokProvider implements INode {
  type: NodeType = "chat-grok";
  private utils: LLMUtils;

  constructor() {
    this.utils = new LLMUtils(new CryptoService());
  }

  private prepareGrokOptions(
    config: LLMOptions,
    definition: NodeDefinition,
  ): Result<GrokOptions, Error> {
    return Result.ok({
      ...config,
      temperature: definition["temperature"],
      maxTokens: definition["maxTokens"],
      streaming: definition["streaming"],
      systemPrompt: definition["systemPrompt"],
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
    const [grokOptions, grokOptionsError] = this.prepareGrokOptions(
      config,
      definition,
    ).toTuple();
    if (grokOptionsError) {
      return Result.error(grokOptionsError);
    }

    const prepareMessages = await this.utils.prepareMessages(
      grokOptions.systemPrompt,
      resolvedInputs,
    );
    const [prepareMessagesResult, prepareMessagesError] =
      prepareMessages.toTuple();
    if (prepareMessagesError) {
      return Result.error(prepareMessagesError);
    }

    const generate = await this.generateResponse(
      prepareMessagesResult,
      grokOptions,
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
    options: GrokOptions,
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
    options: GrokOptions,
  ): Result<ChatGroq, ModelNotFoundError | ProviderAPIError> {
    try {
      return Result.ok(
        new ChatGroq({
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          apiKey: options.decryptedApiKey,
          streaming: options.streaming,
        }),
      );
    } catch (error) {
      return Result.error(
        new ProviderAPIError(`failed to initialize Groq model`),
      );
    }
  }

  private mapApiError(error: unknown, model?: string): GenerateResult {
    return LLMUtils.mapProviderError(error, model, "groq");
  }
}
