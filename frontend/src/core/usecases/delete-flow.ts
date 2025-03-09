import { FlowService } from "@/core/interfaces";
import { deleteFlow } from "../store/flow";

export class DeleteFlowUsecase {
  constructor(private readonly flowService: FlowService) {}

  async execute(id: string) {
    await this.flowService.delete(id);

    deleteFlow(id);
  }
}
