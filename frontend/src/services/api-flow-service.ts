import { Flow, FlowEdge, FlowNode } from "@/core/entities/flow";
import { FlowService } from "@/core/interfaces";
import { WorkflowService } from "@/lib/services/gen-api";

export class ApiFlowService implements FlowService {
  private flows: Flow[] = [];

  async create(data: {
    name: string;
    projectId: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
  }): Promise<Flow> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { id } = await WorkflowService.createWorkflow({
      projectId: data.projectId,
      requestBody: {
        name: data.name,
        builderFlow: {
          nodes: data.nodes,
          edges: data.edges,
        },
      },
    });

    return {
      id,
      nodes: data.nodes,
      edges: data.edges,
      name: data.name,
      projectId: data.projectId,
    };
  }

  async listAll(projectId: string): Promise<Flow[]> {
    const workflows = await WorkflowService.listWorkflows({
      projectId: projectId,
    });

    return workflows.map((workflow) => ({
      id: workflow.id,
      nodes: workflow.builderFlow.nodes,
      edges: workflow.builderFlow.edges,
      name: workflow.name,
      projectId,
    }));
  }

  async patch(
    projectId: string,
    id: string,
    data: { name: string; nodes: FlowNode[]; edges: FlowEdge[] },
  ) {
    await WorkflowService.updateWorkflow({
      projectId: projectId,
      workflowId: id,
      requestBody: {
        name: data.name,
        builderFlow: {
          nodes: data.nodes,
          edges: data.edges,
        },
      },
    });
  }

  async delete(projectId: string, id: string) {
    await WorkflowService.deleteWorkflow({
      projectId,
      workflowId: id,
    });
  }

  async getById(projectId: string, id: string): Promise<Flow | null> {
    const workflow = await WorkflowService.getWorkflow({
      projectId,
      workflowId: id,
    });

    if (!workflow) {
      return null;
    }

    return {
      id: workflow.id,
      nodes: workflow.builderFlow.nodes,
      edges: workflow.builderFlow.edges,
      name: workflow.name,
      projectId,
    };
  }
}
