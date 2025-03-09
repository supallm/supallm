import { OpenAI } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { BaseLLMProvider } from "./base-provider";
import { OpenAIProvider } from "./openai-provider";
import { AnthropicProvider } from "./anthropic-provider";
import { logger } from "../utils/logger";

export interface ProviderConfig {
  provider: "openai" | "anthropic";
  apiKey: string;
  model: string;
}

export class ProviderFactory {
  createLLMProvider(config: ProviderConfig): BaseLLMProvider {
    let { provider, apiKey, model } = config;

    // Utiliser la clé API par défaut si aucune n'est fournie ou si "sk-test" est utilisé
    if (!apiKey || apiKey === "sk-test") {
      logger.info("Using default API key");
      apiKey = process.env.OPENAI_API_KEY || "";
    }

    logger.info(`Creating LLM provider: ${provider}, model: ${model}`);

    switch (provider?.toLowerCase()) {
      case "openai":
        const isChatModel = this.isOpenAIChatModel(model || "");

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

      case "anthropic":
        const anthropicLLM = new ChatAnthropic({
          anthropicApiKey: apiKey,
          modelName: model,
        });
        return new AnthropicProvider(anthropicLLM);

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private isOpenAIChatModel(model: string): boolean {
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
