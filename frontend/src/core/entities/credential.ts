export const AIProviderTypes = [
  "openai",
  "anthropic",
  "mistral",
  "google",
  "azure",
  "ollama",
] as const;

export type AIProviderType = (typeof AIProviderTypes)[number];

export const UtilityProviderTypes = [
  "e2b",
  "notion",
  "postgres",
  "confluence",
  "airtable",
] as const;

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
  ollama: "Ollama",
  e2b: "E2B",
  notion: "Notion",
  postgres: "Postgres",
  confluence: "Confluence",
  airtable: "Airtable",
} as const;

export const CredentialLabel = (name: ProviderType) => {
  return ProviderTypeLabelMap[name];
};
