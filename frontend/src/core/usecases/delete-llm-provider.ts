import { LLMProviderService } from "@/core/interfaces";
import { deleteLLMProvider, patchLLMProvider } from "../store/llm-providers";

export class DeleteLLMProviderUsecase {
  constructor(private readonly llmProviderService: LLMProviderService) {}

  async execute(id: string) {
    await this.llmProviderService.delete(id);

    deleteLLMProvider(id);
  }
}
