import { LLMProviderService } from "@/core/interfaces";
import { LLMProvider } from "../entities/llm-provider";

export class ListLLMProvidersUsecase {
  constructor(private readonly llmProviderService: LLMProviderService) {}

  async execute(projectId: string): Promise<LLMProvider[]> {
    return this.llmProviderService.listAll(projectId);
  }
}
