export const ProviderTypes = [
  "openai",
  "anthropic",
  "google",
  "azure",
  "mistral",
  "e2b",
  "ollama",
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
};

export const CredentialLabel = (name: ProviderType) => {
  return ProviderTypeLabelMap[name];
};
