import { LLMProviderName } from "@/core/entities/llm-provider";
import { Model } from "@/core/entities/model";
import { ModelService } from "@/core/interfaces";

export class MockModelService implements ModelService {
  async create(data: {
    projectId: string;
    name: string;
    credentialId: string;
    providerType: LLMProviderName;
    model: string;
    systemPrompt: string;
    temperature: number;
  }): Promise<Model> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      id: crypto.randomUUID(),
      name: data.name,
      slug: `slug-${crypto.randomUUID()}`,
      credentialId: data.credentialId,
      providerType: data.providerType,
      model: data.model,
      systemPrompt: data.systemPrompt,
      temperature: 0.5,
    };
  }

  async list(): Promise<Model[]> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return [];
  }

  async patch(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async delete(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 4000));
  }
}
