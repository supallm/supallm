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

export const LLMProviderNameLabelMap: Record<LLMProviderName, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  azure: "Azure",
  mistral: "Mistral",
};

export const LLMProviderLabel = (name: LLMProviderName) => {
  return LLMProviderNameLabelMap[name];
};
