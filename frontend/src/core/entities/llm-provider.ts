export const LLMProviderNames = [
  "openai",
  "anthropic",
  "google",
  "azure",
  "claude",
  "groq",
  "gemini",
  "perplexity",
] as const;

export type LLMProviderName = (typeof LLMProviderNames)[number];

export type LLMProvider = {
  id: string;
  provider: LLMProviderName;
  name: string;
  description: string;
};
