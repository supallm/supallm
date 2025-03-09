import { OpenAI } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { BaseLLMProvider } from "./base-provider";
import { OpenAIProvider } from "./openai-provider";
import { AnthropicProvider } from "./anthropic-provider";
import { logger } from "../utils/logger";

export enum ProviderType {
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
}

export interface ProviderConfig {
  provider: ProviderType;
  apiKey: string;
  model: string;
}

export class ProviderFactory {
  createLLMProvider(config: ProviderConfig): BaseLLMProvider {
    let { provider, apiKey, model } = config;

    if (!apiKey || apiKey === "sk-test") {
      logger.info("Using default API key");
      apiKey = process.env.OPENAI_API_KEY || "";
    }

    logger.info(`Creating LLM provider: ${provider}, model: ${model}`);

    switch (provider) {
      case ProviderType.OPENAI:
        const isChatModel = OpenAIProvider.isChatModel(model || "");

        if (isChatModel) {
          const chatModel = new ChatOpenAI({
            openAIApiKey: apiKey,
            modelName: model,
          });
          return new OpenAIProvider(chatModel);
        } else {
          const llm = new OpenAI({
            openAIApiKey: apiKey,
            modelName: model,
          });
          return new OpenAIProvider(llm);
        }

      case ProviderType.ANTHROPIC:
        const anthropicLLM = new ChatAnthropic({
          anthropicApiKey: apiKey,
          modelName: model,
        });
        return new AnthropicProvider(anthropicLLM);

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
