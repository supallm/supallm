import { ModelService } from "../interfaces";
import { deleteModel } from "../store/models";

export class DeleteModelUsecase {
  constructor(private readonly modelService: ModelService) {}

  async execute(id: string) {
    await this.modelService.delete(id);

    deleteModel(id);
  }
}
