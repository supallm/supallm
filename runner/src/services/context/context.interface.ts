import _ from "lodash";
import {
  WorkflowDefinition,
  WorkflowExecutionOptions,
} from "../workflow/types";

export interface NodeExecutionResult {
  nodeId: string;
  success: boolean;
  output: Record<string, any> | null;
  error?: string;
  executionTime: number;
}

export interface ExecutionContext {
  inputs: Record<string, any>;
  outputs: Record<string, Record<string, any>>;
  nodeResults: Record<string, NodeExecutionResult>;
  completedNodes: Set<string>;
  allNodes: Set<string>;
  workflowId: string;
  sessionId: string;
  triggerId: string;
}

export interface IContextService {
  initialize(
    workflowId: string,
    definition: WorkflowDefinition,
    options: WorkflowExecutionOptions
  ): Promise<ManagedExecutionContext>;
  getManagedContext(
    workflowId: string
  ): Promise<ManagedExecutionContext | null>;
  updateContext(
    workflowId: string,
    update: Partial<ExecutionContext>
  ): Promise<void>;
}

export class ManagedExecutionContext {
  context: ExecutionContext;

  constructor(
    private readonly contextService: IContextService,
    readonly workflowId: string,
    context: ExecutionContext
  ) {
    this.context = context;
  }

  internal(): ExecutionContext {
    return _.cloneDeep(this.context);
  }

  private async sync(): Promise<void> {
    await this.contextService.updateContext(this.workflowId, this.context);
  }

  async setOutput(key: string, value: any): Promise<void> {
    this.context.outputs[key] = value;
    await this.sync();
  }

  async addNodeResult(nodeId: string, result: any): Promise<void> {
    this.context.nodeResults[nodeId] = result;
    await this.sync();
  }

  async markNodeCompleted(nodeId: string): Promise<void> {
    this.context.completedNodes.add(nodeId);
    await this.sync();
  }

  async updateNodeResults(
    nodeId: string,
    result: NodeExecutionResult
  ): Promise<void> {
    this.context.nodeResults[nodeId] = result;
    await this.sync();
  }

  async updateOutputs(
    nodeId: string,
    output: Record<string, any>
  ): Promise<void> {
    this.context.outputs[nodeId] = output;
    await this.sync();
  }
}
