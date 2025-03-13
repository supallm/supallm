import { FlowEdge, FlowNode } from "../entities/flow";
import { FlowService } from "../interfaces";
import { patchCurrentFlow, patchFlow } from "../store/flow";

export class PatchFlowUsecase {
  constructor(private readonly service: FlowService) {}

  async execute(
    projectId: string,
    id: string,
    data: {
      name: string;
      nodes: FlowNode[];
      edges: FlowEdge[];
    },
  ) {
    await this.service.patch(projectId, id, data);
    patchFlow(id, data);
    patchCurrentFlow(data);
  }
}
