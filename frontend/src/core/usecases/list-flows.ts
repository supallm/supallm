import { FlowService } from "@/core/interfaces";
import { Flow } from "../entities/flow";
import { setFlowList } from "../store/flow";

export class ListFlowsUsecase {
  constructor(private readonly flowService: FlowService) {}

  async execute(): Promise<Flow[]> {
    const flows = await this.flowService.listAll();

    setFlowList(flows);

    return flows;
  }
}
