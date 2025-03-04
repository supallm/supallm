import { LLMProviderService } from "@/core/interfaces";
import { patchLLMProvider } from "../store/llm-providers";

export class PatchLLMProviderUsecase {
  constructor(private readonly llmProviderService: LLMProviderService) {}

  async execute(
    id: string,
    data: {
      name: string;
      apiKey: string | undefined;
    },
  ) {
    const provider = await this.llmProviderService.patch(id, data);

    patchLLMProvider(id, {
      name: data.name,
    });
  }
}
