import { LLMProvider, LLMProviderName } from "../entities/llm-provider";
import { ModelService } from "../interfaces";
import { addModel } from "../store/models";

export class CreateModelUsecase {
  constructor(private readonly modelService: ModelService) {}

  async execute(req: {
    name: string;
    apiKey: string;
    providerType: LLMProviderName;
    projectId: string;
  }): Promise<LLMProvider> {
    const provider = await this.modelService.create(req);

    addModel(provider);

    return provider;
  }
}
