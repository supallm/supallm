import { LLMProviderService } from "@/core/interfaces";
import { LLMProvider } from "../entities/llm-provider";
import { getLLMProviders } from "../store/llm-providers";

export class ListLLMProvidersUsecase {
  constructor(private readonly llmProviderService: LLMProviderService) {}

  async execute(projectId: string): Promise<LLMProvider[]> {
    const providers = getLLMProviders();

    if (providers.length) {
      return providers;
    }

    return this.llmProviderService.listAll(projectId);
  }
}
