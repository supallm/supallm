import { ModelService } from "@/core/interfaces";

export class MockModelService implements ModelService {
  async create(data: {
    projectId: string;
    name: string;
    credentialId: string;
    providerType: LLMProviderName;
    model: string;
    systemPrompt: string;
  }): Promise<Model> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      id: "1",
      name: "test",
      slug: "test",
      credentialId: "1",
      model: "test",
      systemPrompt: "test",
    };
  }

  async list(projectId: string): Promise<Model[]> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return [];
  }

  async patch(
    id: string,
    data: {
      name: string;
      credentialId: string;
      systemPrompt: string;
      temperature: number;
    },
  ): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async delete(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
