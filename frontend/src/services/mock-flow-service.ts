import { Flow, FlowEdge, FlowNode } from "@/core/entities/flow";
import { FlowService } from "@/core/interfaces";
import { getAuthToken } from "@/lib/auth";

export class MockFlowService implements FlowService {
  private flows: Flow[] = [];
  private storage: Storage | null;

  constructor() {
    this.storage = typeof window !== "undefined" ? window.sessionStorage : null;
  }

  private load() {
    const flows = this.storage?.getItem("mock-flows");
    if (flows) {
      this.flows = JSON.parse(flows);
    }
  }

  private save() {
    this.storage?.setItem("mock-flows", JSON.stringify(this.flows));
  }

  async create(data: {
    name: string;
    projectId: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
  }): Promise<Flow> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const createdFlow = {
      id: crypto.randomUUID(),
      name: data.name,
      projectId: data.projectId,
      nodes: data.nodes,
      edges: data.edges,
    };

    this.flows.push(createdFlow);
    this.save();

    return createdFlow;
  }

  async listAll(): Promise<Flow[]> {
    const authToken = await getAuthToken();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.load();

    return this.flows;
  }

  async patch(id: string, data: Partial<Flow>) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.load();

    const index = this.flows.findIndex((flow) => flow.id === id);

    if (index === -1) {
      return;
    }

    this.flows[index] = { ...this.flows[index], ...data };

    this.save();
  }

  async delete(id: string) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.flows = this.flows.filter((flow) => flow.id !== id);
    this.save();
  }

  async getById(id: string): Promise<Flow | null> {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.load();

    const flow = this.flows.find((flow) => flow.id === id);

    if (!flow) {
      return null;
    }

    return flow;
  }
}
