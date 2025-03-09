import { OpenAIProvider } from "./openai";
import { LLMProvider } from "./llm-provider";

export interface ProviderConfig {
  provider: string;
  apiKey: string;
  model: string;
}

export class ProviderFactory {
  createLLMProvider(config: ProviderConfig): LLMProvider {
    switch (config.provider) {
      case "openai":
        return new OpenAIProvider(config.apiKey, config.model);
      default:
        throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
  }
}
