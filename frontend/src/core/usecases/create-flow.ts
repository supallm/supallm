import { randomName } from "@/lib/docker-name";
import { Flow, FlowNode } from "../entities/flow";
import { FlowService } from "../interfaces";
import { addFlow } from "../store/flow";

export class CreateFlowUsecase {
  constructor(private readonly service: FlowService) {}

  async execute(req: { projectId: string }): Promise<Flow> {
    const name = randomName();
    const defaultNodes: FlowNode[] = [
      {
        id: "entrypoint-node",
        type: "entrypoint",
        position: { x: 100, y: 200 },
        data: {
          handles: [],
        },
        deletable: false,
        zIndex: 1,
      },
      {
        id: "result-node",
        type: "result",
        position: { x: 900, y: 200 },
        data: {
          handles: [],
        },
        deletable: false,
        zIndex: 1,
      },
    ];
    const flow = await this.service.create({
      name: name,
      projectId: req.projectId,
      nodes: defaultNodes,
      edges: [],
    });

    addFlow(flow);

    return flow;
  }
}
