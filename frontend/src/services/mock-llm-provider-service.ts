import { LLMProvider } from "@/core/entities/llm-provider";
import { LLMProviderService } from "@/core/interfaces";
import { getAuthToken } from "@/lib/auth";

export class MockLLMProviderService implements LLMProviderService {
  async listAll(projectId: string): Promise<LLMProvider[]> {
    const authToken = await getAuthToken();

    console.log("listAll", projectId, authToken);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return [];

    return [
      {
        id: "1",
        provider: "openai",
        name: "My provider",
        description: "Mock Provider",
      },
      {
        id: "2",
        provider: "openai",
        name: "My provider",
        description: "Mock Provider",
      },
      {
        id: "3",
        provider: "openai",
        name: "My provider",
        description: "Mock Provider",
      },
    ];
  }
}
