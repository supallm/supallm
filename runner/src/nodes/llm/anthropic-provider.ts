import { ChatAnthropic } from "@langchain/anthropic";
import { BaseLLMProvider, LLMOptions } from "./base-provider";
import { logger } from "../../utils/logger";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export class AnthropicProvider implements BaseLLMProvider {
  constructor() {}

  async generate(
    messages: (SystemMessage | HumanMessage)[],
    options: LLMOptions
  ): Promise<AsyncIterable<{ content: string }>> {
    const model = this.createModel(options);
    try {
      const stream = await model.stream(messages);

      return {
        [Symbol.asyncIterator]: async function* () {
          for await (const chunk of stream) {
            if (typeof chunk === 'object' && chunk !== null && 'content' in chunk) {
              const contentStr = String(chunk.content);
              yield { content: contentStr };
            }
          }
        },
      };
    } catch (error) {
      logger.error(`Error streaming with Anthropic: ${error}`);
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