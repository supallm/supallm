import { LLMProvider, LLMProviderName } from "@/core/entities/llm-provider";
import { LLMProviderService } from "@/core/interfaces";
import { getAuthToken } from "@/lib/auth";

export class MockLLMProviderService implements LLMProviderService {
  async create(data: {
    name: string;
    apiKey: string;
    providerType: LLMProviderName;
  }): Promise<LLMProvider> {
    const authToken = await getAuthToken();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const createdProvider = {
      id: crypto.randomUUID(),
      providerType: data.providerType,
      name: data.name,
      apiKeyPreview: data.apiKey.slice(0, 4) + "...",
    };

    return createdProvider;
  }

  async listAll(projectId: string): Promise<LLMProvider[]> {
    const authToken = await getAuthToken();

    console.log("listAll", projectId, authToken);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return [];
  }

  async patch(
    id: string,
    data: {
      name: string;
      apiKey: string | undefined;
    },
  ) {
    const authToken = await getAuthToken();

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
