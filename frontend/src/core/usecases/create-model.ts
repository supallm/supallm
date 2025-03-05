import { ProviderType } from "../entities/credential";
import { Model } from "../entities/model";
import { ModelService } from "../interfaces";
import { addModel } from "../store/models";

export class CreateModelUsecase {
  constructor(private readonly modelService: ModelService) {}

  async execute(req: {
    projectId: string;
    name: string;
    credentialId: string;
    providerType: ProviderType;
    model: string;
    systemPrompt: string;
    temperature: number;
  }): Promise<Model> {
    const model = await this.modelService.create(req);

    addModel(model);

    return model;
  }
}
