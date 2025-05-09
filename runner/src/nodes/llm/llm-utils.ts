import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { Result } from "typescript-result";
import { CryptoService } from "../../services/secret/crypto-service";
import { logger } from "../../utils/logger";
import { NodeDefinition, NodeInput, NodeOutput, NodeOutputDef } from "../types";
import {
  InvalidInputError,
  InvalidOutputError,
  LLMExecutionError,
  MissingAPIKeyError,
  ModelNotFoundError,
  ProviderAPIError,
} from "./llm.errors";

export type GenerateResult = Result<
  AsyncIterable<{ content: string }>,
  LLMExecutionError
>;

export interface LLMNodeInputs {
  prompt: string;
  images?: string[];
}

export interface LLMOptions {
  model: string;
  decryptedApiKey: string;
}

export interface ValidationResult {
  resolvedInputs: LLMNodeInputs;
  resolvedOutputs: NodeOutputDef;
  config: LLMOptions;
}

export class LLMUtils {
  constructor(private cryptoService: CryptoService) {}

  async validateAndPrepare(
    definition: NodeDefinition,
    inputs: NodeInput,
  ): Promise<Result<ValidationResult, LLMExecutionError>> {
    const [resolvedInputs, inputError] = this.validateInputs(inputs).toTuple();
    if (inputError) {
      return Result.error(inputError);
    }

    const [resolvedOutputs, outputError] = this.validateOutputs(
      definition.outputs,
    ).toTuple();
    if (outputError) {
      return Result.error(outputError);
    }

    const { model, apiKey } = definition.config;
    if (!model) {
      return Result.error(
        new MissingAPIKeyError("model parameter is required"),
      );
    }

    let decryptedApiKey: string = "";
    if (apiKey) {
      const [decryptedApiKeyResult, decryptedApiKeyError] = this.cryptoService
        .decrypt(apiKey)
        .toTuple();
      if (decryptedApiKeyError) {
        return Result.error(decryptedApiKeyError);
      }

      decryptedApiKey = decryptedApiKeyResult;
    }

    return Result.ok({
      resolvedInputs,
      resolvedOutputs,
      config: {
        model,
        decryptedApiKey,
      },
    });
  }

  async prepareMessages(
    systemPrompt: string | undefined,
    inputs: LLMNodeInputs,
  ): Promise<Result<BaseMessage[], LLMExecutionError>> {
    return this.createMessagesFromInputs(systemPrompt, inputs);
  }

  static async handleStreamingResponse<T>(
    model: T,
    messages: BaseMessage[],
    streamMethod: (
      model: T,
      messages: BaseMessage[],
    ) => Promise<AsyncIterable<any>>,
  ): Promise<GenerateResult> {
    try {
      const stream = await streamMethod(model, messages);

      return Result.ok({
        [Symbol.asyncIterator]: async function* () {
          for await (const chunk of stream) {
            if (
              typeof chunk === "object" &&
              chunk !== null &&
              "content" in chunk
            ) {
              const contentStr = String(chunk.content);
              yield { content: contentStr };
            }
          }
        },
      });
    } catch (error) {
      logger.error(`streaming response error from ${model} provider`, error);
      return Result.error(
        new ProviderAPIError(`streaming response error from ${model} provider`),
      );
    }
  }

  static async handleNonStreamingResponse<T>(
    model: T,
    messages: BaseMessage[],
    invokeMethod: (model: T, messages: BaseMessage[]) => Promise<any>,
  ): Promise<GenerateResult> {
    try {
      const response = await invokeMethod(model, messages);
      const responseContent = LLMUtils.parseModelResponse(response);

      return Result.ok({
        [Symbol.asyncIterator]: async function* () {
          yield { content: responseContent };
        },
      });
    } catch (error) {
      logger.error(
        `non-streaming response error from ${model} provider`,
        error,
      );
      return Result.error(
        new ProviderAPIError(`non-streaming response error from ${model}`),
      );
    }
  }

  private validateInputs(
    inputs: NodeInput,
  ): Result<LLMNodeInputs, LLMExecutionError> {
    if (!inputs || typeof inputs !== "object") {
      return Result.error(
        new InvalidInputError("invalid input: inputs must be an object"),
      );
    }

    if (typeof inputs["prompt"] !== "string") {
      return Result.error(
        new InvalidInputError("invalid input: missing or invalid prompt"),
      );
    }

    if (inputs["images"] !== undefined && !Array.isArray(inputs["images"])) {
      return Result.error(
        new InvalidInputError("invalid input: images must be an array"),
      );
    }

    if (Array.isArray(inputs["images"])) {
      const hasInvalidImage = inputs["images"].some(
        (img) => typeof img !== "string",
      );
      if (hasInvalidImage) {
        return Result.error(
          new InvalidInputError("invalid input: all images must be strings"),
        );
      }
    }

    return Result.ok({
      prompt: inputs["prompt"] as string,
      images: Array.isArray(inputs["images"])
        ? (inputs["images"] as string[])
        : undefined,
    });
  }

  private validateOutputs(
    outputs: NodeOutput,
  ): Result<NodeOutputDef, InvalidOutputError> {
    if (!outputs || typeof outputs !== "object") {
      return Result.error(
        new InvalidOutputError("invalid output: outputs must be an object"),
      );
    }

    if (!outputs["response"]) {
      return Result.error(
        new InvalidOutputError("invalid output: missing response"),
      );
    }

    const output = outputs["response"] as NodeOutputDef;
    return Result.ok(output);
  }

  private createMessagesFromInputs(
    systemPrompt: string | undefined,
    inputs: LLMNodeInputs,
  ): Result<BaseMessage[], LLMExecutionError> {
    const messages: BaseMessage[] = [];

    if (systemPrompt) {
      messages.push(new SystemMessage(systemPrompt));
    }

    messages.push(new HumanMessage(inputs.prompt));

    return Result.ok(messages);
  }

  static parseModelResponse(response: any): string {
    if (
      typeof response === "object" &&
      response !== null &&
      "content" in response
    ) {
      return typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);
    } else if (typeof response === "string") {
      return response;
    } else {
      return JSON.stringify(response);
    }
  }

  static formatChunkContent(data: { content: string | object }): string {
    return typeof data.content === "string"
      ? data.content
      : JSON.stringify(data.content);
  }

  static mapProviderError(
    error: unknown,
    model: string | undefined,
    providerName: string,
  ): GenerateResult {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (
        message.includes("api key") ||
        message.includes("apikey") ||
        message.includes("authentication") ||
        message.includes("unauthorized")
      ) {
        return Result.error(
          new MissingAPIKeyError(`invalid ${providerName} API key`),
        );
      }

      if (
        message.includes("model") ||
        message.includes("not found") ||
        message.includes("doesn't exist") ||
        message.includes("invalid model")
      ) {
        return Result.error(
          new ModelNotFoundError(
            `${providerName} model not found: ${model || "unknown"}`,
          ),
        );
      }

      if (typeof error === "object" && error !== null && "status" in error) {
        const status = Number(error.status);
        return Result.error(
          new ProviderAPIError(`${providerName} API error`, status),
        );
      }
    }

    logger.error(`error with ${providerName} provider`, error);
    return Result.error(
      new ProviderAPIError(`error with ${providerName} provider`),
    );
  }
}
