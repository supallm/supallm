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
}
