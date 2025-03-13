import { FlowService } from "@/core/interfaces";
import { deleteFlow } from "../store/flow";

export class DeleteFlowUsecase {
  constructor(private readonly flowService: FlowService) {}

  async execute(projectId: string, id: string) {
    await this.flowService.delete(projectId, id);

    deleteFlow(id);
  }
}
