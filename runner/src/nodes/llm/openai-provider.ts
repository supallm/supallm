import { OpenAI } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { BaseLLMProvider, LLMOptions } from "./base-provider";
import { logger } from "../../utils/logger";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export class OpenAIProvider implements BaseLLMProvider {
  constructor() {}

  async generate(
    messages: (SystemMessage | HumanMessage)[],
    options: LLMOptions
  ): Promise<AsyncIterable<{ content: string }>> {
    const model = this.createModel(options);
    try {
      if (model instanceof ChatOpenAI && options.streaming) {
        const stream = await model.stream(messages);

        return {
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
        };
      } else {
        const response = await model.invoke(messages);
        let responseContent = "";
        if (
          typeof response === "object" &&
          response !== null &&
          "content" in response
        ) {
          responseContent =
            typeof response.content === "string"
              ? response.content
              : JSON.stringify(response.content);
        } else if (typeof response === "string") {
          responseContent = response;
        } else {
          responseContent = JSON.stringify(response);
        }

        return {
          [Symbol.asyncIterator]: async function* () {
            yield { content: responseContent };
          },
        };
      }
    } catch (error) {
      logger.error(`Error streaming with OpenAI: ${error}`);
      throw error;
    }
  }

  private createModel(options: LLMOptions): OpenAI | ChatOpenAI {
    const isChatModel = this.isChatModel(options.model);

    if (isChatModel) {
      return new ChatOpenAI({
        modelName: options.model,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        openAIApiKey: options.apiKey,
        streaming: options.streaming,
      });
    } else {
      return new OpenAI({
        modelName: options.model,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        openAIApiKey: options.apiKey,
        streaming: options.streaming,
      });
    }
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
      model.toLowerCase().startsWith(chatModel.toLowerCase())
    );
  }
}
