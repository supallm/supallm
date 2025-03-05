import { LLMProviderService } from "@/core/interfaces";
import { LLMProvider } from "../entities/llm-provider";
import { getLLMProviders, setLLMProviders } from "../store/llm-providers";

export class ListLLMProvidersUsecase {
  constructor(private readonly llmProviderService: LLMProviderService) {}

  async execute(projectId: string): Promise<LLMProvider[]> {
    const inStore = getLLMProviders();

    if (inStore.length) {
      return inStore;
    }

    const providers = await this.llmProviderService.listAll(projectId);

    setLLMProviders(providers);

    return providers;
  }
}
