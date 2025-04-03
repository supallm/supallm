export const AIProviderTypes = [
  "openai",
  "anthropic",
  "mistral",
  "ollama",
  "google",
  "azure",
] as const;

export type AIProviderType = (typeof AIProviderTypes)[number];

export const UtilityProviderTypes = ["e2b", "notion"] as const;

export type UtilityProviderType = (typeof UtilityProviderTypes)[number];

export const ProviderTypes = [
  ...AIProviderTypes,
  ...UtilityProviderTypes,
] as const;

export type ProviderType = (typeof ProviderTypes)[number];

export type Credential = {
  id: string;
  providerType: ProviderType;
  name: string;
  apiKeyPreview: string;
  projectId: string;
};

export const ProviderTypeLabelMap: Record<ProviderType, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  azure: "Azure",
  mistral: "Mistral",
  e2b: "E2B",
  ollama: "Ollama",
  notion: "Notion",
};

export const CredentialLabel = (name: ProviderType) => {
  return ProviderTypeLabelMap[name];
};
