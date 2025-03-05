import { LLMProviderName } from "./llm-provider";

export type Model = {
  id: string;
  name: string;
  slug: string;
  credentialId: string;
  providerType: LLMProviderName;
  model: string;
  systemPrompt: string;
  temperature: number;
};
