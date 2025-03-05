import { ProviderType } from "./credential";

export type Model = {
  id: string;
  name: string;
  slug: string;
  credentialId: string;
  providerType: ProviderType;
  model: string;
  systemPrompt: string;
  temperature: number;
};
