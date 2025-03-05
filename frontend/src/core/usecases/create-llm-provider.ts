import { LLMProviderService } from "@/core/interfaces";
import { LLMProvider, LLMProviderName } from "../entities/llm-provider";
import { addLLMProvider } from "../store/llm-providers";

export class CreateLLMProviderUsecase {
  constructor(private readonly llmProviderService: LLMProviderService) {}

  async execute(req: {
    name: string;
    apiKey: string;
    providerType: LLMProviderName;
    projectId: string;
  }): Promise<LLMProvider> {
    const provider = await this.llmProviderService.create(req);

    addLLMProvider(provider);

    return provider;
  }
}
