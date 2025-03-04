export const LLMProviderNames = [
  "openai",
  "anthropic",
  "google",
  "azure",
  "mistral",
] as const;

export type LLMProviderName = (typeof LLMProviderNames)[number];

export type LLMProvider = {
  id: string;
  provider: LLMProviderName;
  name: string;
  description: string;
};
