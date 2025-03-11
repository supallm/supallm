import { OpenAI } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { BaseLLMProvider, LLMOptions } from "./base-provider";
import { logger } from "../../utils/logger";

export class OpenAIProvider implements BaseLLMProvider {
  constructor() {}

  async generate(prompt: string, options: LLMOptions): Promise<any> {
    logger.info(`generating with OpenAI: ${prompt.substring(0, 50)}...`);
    const model = this.createModel(options);
    try {
      if (model instanceof ChatOpenAI) {
        const response = await model.invoke(prompt);
        return { text: response.content };
      } else {
        const response = await model.invoke(prompt);
        return { text: response };
      }
    } catch (error) {
      logger.error(`error generating with OpenAI: ${error}`);
      throw error;
    }
  }

  async stream(prompt: string, options: LLMOptions): Promise<any> {
    logger.info(`streaming with OpenAI: ${prompt.substring(0, 50)}...`);
    const model = this.createModel(options);
    try {
      if (model instanceof ChatOpenAI) {
        const stream = await model.stream(prompt);

        // Transform the stream for easier handling
        return {
          [Symbol.asyncIterator]: async function* () {
            for await (const chunk of stream) {
              if (chunk.content) {
                yield { content: chunk.content };
              }
            }
          },
        };
      } else {
        // For non-chat models, simulate a stream with a single response
        const response = await model.invoke(prompt);
        return {
          [Symbol.asyncIterator]: async function* () {
            yield { text: response };
          },
        };
      }
    } catch (error) {
      logger.error(`error streaming with OpenAI: ${error}`);
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
