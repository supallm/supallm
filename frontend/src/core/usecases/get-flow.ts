import { Flow } from "../entities/flow";
import { FlowService } from "../interfaces";
import { clearCurrentFlow, setCurrentFlow } from "../store/flow";

export class GetFlowUsecase {
  constructor(private readonly service: FlowService) {}

  async execute(id: string): Promise<Flow | null> {
    clearCurrentFlow();

    const flow = await this.service.getById(id);

    if (flow) {
      setCurrentFlow(flow);
    }

    return flow;
  }
}
