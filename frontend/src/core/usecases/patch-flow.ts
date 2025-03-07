import { Flow } from "../entities/flow";
import { FlowService } from "../interfaces";
import { patchFlow } from "../store/flow";

export class PatchFlowUsecase {
  constructor(private readonly service: FlowService) {}

  async execute(id: string, data: Partial<Flow>) {
    await this.service.patch(id, data);
    patchFlow(id, data);
  }
}
