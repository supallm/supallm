import { Flow } from "../entities/flow";
import { FlowService } from "../interfaces";
import { clearCurrentFlow, setCurrentFlow } from "../store/flow";

export class GetFlowUsecase {
  constructor(private readonly service: FlowService) {}

  async execute(projectId: string, id: string): Promise<Flow | null> {
    clearCurrentFlow();

    const flow = await this.service.getById(projectId, id);

    if (flow) {
      setCurrentFlow(flow);
    }

    return flow;
  }
}
