import { BaseMessage } from "@langchain/core/messages";
import { ChatMistralAI } from "@langchain/mistralai";
import { Result } from "typescript-result";
import { CryptoService } from "../../services/secret/crypto-service";
import { Tool, ToolContext } from "../../tools";
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

export class MistralProvider implements INode {
  type: NodeType = "chat-mistral";
  private utils: LLMUtils;

  constructor() {
    this.utils = new LLMUtils(new CryptoService());
  }

  async execute(
    nodeId: string,
    definition: NodeDefinition,
    inputs: NodeInput,
    tools: Record<string, Tool>,
    options: NodeOptions,
  ): Promise<Result<NodeOutput, Error>> {
    const toolContext = new ToolContext(this.type, tools);
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

    const prepareMessages = await this.utils.prepareMessages(
      nodeId,
      toolContext,
      config.systemPrompt,
      resolvedInputs,
      options.sessionId,
    );
    const [prepareMessagesResult, prepareMessagesError] =
      prepareMessages.toTuple();
    if (prepareMessagesError) {
      return Result.error(prepareMessagesError);
    }

    const generate = await this.generateResponse(prepareMessagesResult, config);
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

    if (fullResponse) {
      await this.utils.appendToMemory(
        toolContext,
        nodeId,
        options.sessionId,
        resolvedInputs.prompt,
        fullResponse,
      );
    }

    return Result.ok({ response: fullResponse });
  }

  private async generateResponse(
    messages: BaseMessage[],
    options: LLMOptions,
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
    options: LLMOptions,
  ): Result<ChatMistralAI, ModelNotFoundError | ProviderAPIError> {
    try {
      return Result.ok(
        new ChatMistralAI({
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          apiKey: options.apiKey,
          streaming: options.streaming,
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
