import { OpenAI } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { BaseLLMProvider } from "./base-provider";
import { logger } from "../utils/logger";

export class OpenAIProvider implements BaseLLMProvider {
  private model: OpenAI | ChatOpenAI;

  constructor(model: OpenAI | ChatOpenAI) {
    this.model = model;
  }

  async generate(prompt: string, options: any = {}): Promise<any> {
    logger.info(`Generating with OpenAI: ${prompt.substring(0, 50)}...`);

    try {
      if (this.model instanceof ChatOpenAI) {
        const response = await this.model.invoke(prompt);
        return { text: response.content };
      } else {
        const response = await this.model.invoke(prompt);
        return { text: response };
      }
    } catch (error) {
      logger.error(`Error generating with OpenAI: ${error}`);
      throw error;
    }
  }

  async stream(prompt: string, options: any = {}): Promise<any> {
    logger.info(`Streaming with OpenAI: ${prompt.substring(0, 50)}...`);

    try {
      if (this.model instanceof ChatOpenAI) {
        const response = await this.model.stream(prompt);
        return response;
      } else {
        const response = await this.model.invoke(prompt);
        return { text: response };
      }
    } catch (error) {
      logger.error(`Error streaming with OpenAI: ${error}`);
      throw error;
    }
  }

  static isChatModel(model: string): boolean {
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
