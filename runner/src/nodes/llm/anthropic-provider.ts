import { ChatAnthropic } from "@langchain/anthropic";
import { BaseLLMProvider, LLMOptions } from "./base-provider";
import { logger } from "../../utils/logger";

export class AnthropicProvider implements BaseLLMProvider {
  constructor() {}

  async generate(
    prompt: string,
    options: LLMOptions
  ): Promise<AsyncIterable<{ content: string }>> {
    logger.info(`streaming with Anthropic: ${prompt.substring(0, 50)}...`);
    const model = this.createModel(options);
    try {
      const stream = await model.stream(prompt);

      // Transform the stream for easier handling
      return {
        [Symbol.asyncIterator]: async function* () {
          for await (const chunk of stream) {
            if (chunk.content) {
              const contentStr = String(chunk.content);
              yield { content: contentStr };
            }
          }
        },
      };
    } catch (error) {
      logger.error(`error streaming with Anthropic: ${error}`);
      throw error;
    }
  }

  private createModel(options: LLMOptions): ChatAnthropic {
    return new ChatAnthropic({
      modelName: options.model,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      anthropicApiKey: options.apiKey,
      streaming: options.streaming,
    });
  }
} 