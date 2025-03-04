import { LLMProvider, LLMProviderName } from "@/core/entities/llm-provider";
import { LLMProviderService } from "@/core/interfaces";
import { getAuthToken } from "@/lib/auth";

export class MockLLMProviderService implements LLMProviderService {
  private providers: LLMProvider[] = [];

  async create(data: {
    name: string;
    apiKey: string;
    providerType: LLMProviderName;
  }): Promise<LLMProvider> {
    const authToken = await getAuthToken();

    console.log("create", data, authToken);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.providers.push({
      id: crypto.randomUUID(),
      provider: "openai",
      name: "My provider",
      description: "Mock Provider",
    });

    return {
      id: "1",
      provider: "openai",
      name: "My provider",
      description: "Mock Provider",
    };
  }

  async listAll(projectId: string): Promise<LLMProvider[]> {
    const authToken = await getAuthToken();

    console.log("listAll", projectId, authToken);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return this.providers;
  }
}
