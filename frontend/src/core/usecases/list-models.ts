import { Model } from "../entities/model";
import { ModelService } from "../interfaces";
import { setModels } from "../store/models";

export class ListModelUsecase {
  constructor(private readonly modelService: ModelService) {}

  async execute(projectId: string): Promise<Model[]> {
    const model = await this.modelService.list(projectId);

    setModels(model);

    return model;
  }
}
