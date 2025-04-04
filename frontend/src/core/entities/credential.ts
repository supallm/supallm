export const AIProviderTypes = [
  "openai",
  "anthropic",
  "mistral",
  "google",
  "azure",
] as const;

export const UtilityProviderTypes = ["e2b", "notion", "postgres"] as const;

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
  mistral: "Mistral",
  google: "Google",
  azure: "Azure",
  e2b: "E2B",
  notion: "Notion",
  postgres: "Postgres",
} as const;

export const CredentialLabel = (name: ProviderType) => {
  return ProviderTypeLabelMap[name];
};
