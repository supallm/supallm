import { ChatAnthropic } from "@langchain/anthropic";
import { BaseLLMProvider } from "./base-provider";
import { logger } from "../utils/logger";

export class AnthropicProvider implements BaseLLMProvider {
  private model: ChatAnthropic;

  constructor(model: ChatAnthropic) {
    this.model = model;
  }

  async generate(prompt: string, options: any = {}): Promise<any> {
    logger.info(`Generating with Anthropic: ${prompt.substring(0, 50)}...`);

    try {
      const response = await this.model.invoke(prompt);
      return { text: response.content };
    } catch (error) {
      logger.error(`Error generating with Anthropic: ${error}`);
      throw error;
    }
  }
}
