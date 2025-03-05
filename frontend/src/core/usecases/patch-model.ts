import { ModelService } from "../interfaces";
import { patchModel } from "../store/models";

export class PatchModelUsecase {
  constructor(private readonly modelService: ModelService) {}

  async execute(
    id: string,
    req: {
      name: string;
      credentialId: string;
      model: string;
      systemPrompt: string;
      temperature: number;
    },
  ) {
    const model = await this.modelService.patch(id, req);

    patchModel(id, req);
  }
}
