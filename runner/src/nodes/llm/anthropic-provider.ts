import { ChatAnthropic } from "@langchain/anthropic";
import { BaseMessage } from "@langchain/core/messages";
import { Result } from "typescript-result";
import { BaseLLMProvider, GenerateResult, LLMOptions } from "./base-provider";
import {
  LLMResult,
  MissingAPIKeyError,
  ModelNotFoundError,
  ProviderAPIError,
} from "./llm.errors";

export class AnthropicProvider implements BaseLLMProvider {
  constructor() {}

  async generate(
    messages: BaseMessage[],
    options: LLMOptions,
  ): Promise<LLMResult<GenerateResult>> {
    try {
      const [model, modelError] = this.createModel(options).toTuple();
      if (modelError) {
        return Result.error(modelError);
      }

      if (options.streaming) {
        return this.handleStreamingResponse(model, messages);
      } else {
        return this.handleNonStreamingResponse(model, messages);
      }
    } catch (error) {
      return this.mapApiError(error, options.model);
    }
  }

  private async handleStreamingResponse(
    model: ChatAnthropic,
    messages: BaseMessage[],
  ): Promise<LLMResult<GenerateResult>> {
    try {
      const stream = await model.stream(messages);

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
      return this.mapApiError(error);
    }
  }

  private async handleNonStreamingResponse(
    model: ChatAnthropic,
    messages: BaseMessage[],
  ): Promise<LLMResult<GenerateResult>> {
    try {
      const response = await model.invoke(messages);
      const responseContent = this.parseModelResponse(response);

      return Result.ok({
        [Symbol.asyncIterator]: async function* () {
          yield { content: responseContent };
        },
      });
    } catch (error) {
      return this.mapApiError(error);
    }
  }

  private parseModelResponse(response: any): string {
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

  private createModel(
    options: LLMOptions,
  ): Result<ChatAnthropic, ModelNotFoundError | ProviderAPIError> {
    try {
      return Result.ok(
        new ChatAnthropic({
          modelName: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          anthropicApiKey: options.apiKey,
          streaming: options.streaming,
        }),
      );
    } catch (error) {
      return Result.error(
        new ProviderAPIError(
          `failed to initialize Anthropic model: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  }

  private mapApiError(
    error: unknown,
    model?: string,
  ): LLMResult<GenerateResult> {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (
        message.includes("model") ||
        message.includes("not found") ||
        message.includes("invalid model")
      ) {
        return Result.error(
          new ModelNotFoundError(
            `Anthropic model not found: ${model || "unknown"}`,
          ),
        );
      }

      if (
        message.includes("api key") ||
        message.includes("authentication") ||
        message.includes("unauthorized")
      ) {
        return Result.error(
          new MissingAPIKeyError(`Invalid Anthropic API key: ${error.message}`),
        );
      }

      if (typeof error === "object" && error !== null && "status" in error) {
        const status = Number(error.status);
        return Result.error(
          new ProviderAPIError(`Anthropic API error: ${error.message}`, status),
        );
      }
    }

    return Result.error(
      new ProviderAPIError(
        `Error with Anthropic provider: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}
