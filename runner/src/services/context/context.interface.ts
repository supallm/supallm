import _ from "lodash";
import {
  WorkflowDefinition,
  WorkflowExecutionOptions,
} from "../workflow/types";
import { NodeDefinition } from "../../nodes/types";
import { logger } from "../../utils/logger";

export interface WorkflowInputs {
  [key: string]: any;
}

export interface NodeExecution {
  id: string;
  success: boolean;
  inputs: Record<string, any> | null;
  output: Record<string, any> | null;
  error?: string;
  executionTime: number;
}

export interface ExecutionContext {
  workflowId: string;
  sessionId: string;
  triggerId: string;
  workflowInputs: WorkflowInputs;
  nodeExecutions: Record<string, NodeExecution>;
  completedNodes: Set<string>;
  allNodes: Set<string>;
}

export interface IContextService {
  initialize(
    workflowId: string,
    definition: WorkflowDefinition,
    options: WorkflowExecutionOptions
  ): Promise<ManagedExecutionContext>;
  getManagedContext(
    workflowId: string,
    triggerId: string
  ): Promise<ManagedExecutionContext | null>;
  updateContext(
    workflowId: string,
    triggerId: string,
    update: Partial<ExecutionContext>
  ): Promise<void>;
}

export class ManagedExecutionContext {
  context: ExecutionContext;

  constructor(
    private readonly contextService: IContextService,
    readonly workflowId: string,
    readonly triggerId: string,
    context: ExecutionContext
  ) {
    this.context = context;
  }

  get get(): ExecutionContext {
    return _.cloneDeep(this.context);
  }

  private async sync(): Promise<void> {
    await this.contextService.updateContext(
      this.workflowId,
      this.triggerId,
      this.context
    );
  }

  async addNode(nodeId: string, execution: NodeExecution): Promise<void> {
    this.context.nodeExecutions[nodeId] = execution;
    await this.sync();
  }

  async markNodeCompleted(nodeId: string): Promise<void> {
    this.context.completedNodes.add(nodeId);
    await this.sync();
  }

  async updateNode(nodeId: string, execution: NodeExecution): Promise<void> {
    this.context.nodeExecutions[nodeId] = execution;
    await this.sync();
  }

  async updateNodeInputs(
    nodeId: string,
    inputs: Record<string, any>
  ): Promise<void> {
    this.context.nodeExecutions[nodeId].inputs = inputs;
    await this.sync();
  }

  async updateNodeOutputs(
    nodeId: string,
    output: Record<string, any>
  ): Promise<void> {
    this.context.nodeExecutions[nodeId].output = output;
    await this.sync();
  }

  async updateNodeError(nodeId: string, error: string): Promise<void> {
    this.context.nodeExecutions[nodeId].error = error;
    await this.sync();
  }

  entrypoint(): NodeExecution {
    return this.context.nodeExecutions.entrypoint;
  }

  result(): NodeExecution {
    return this.context.nodeExecutions.result;
  }

  node(nodeId: string): NodeExecution | undefined {
    return this.context.nodeExecutions[nodeId];
  }

  resultNodes(definition: WorkflowDefinition): NodeExecution[] {
    const resultNodes = Object.entries(definition.nodes)
      .filter(([_, node]) => node.type === "result")
      .map(([id, _]) => id);

    return resultNodes.map((id) => this.context.nodeExecutions[id]);
  }

  findReadyNodes(dependencies: Record<string, string[]>): string[] {
    return Array.from(this.context.allNodes)
      .filter((nodeId) => !this.context.completedNodes.has(nodeId))
      .filter((nodeId) => {
        const nodeDeps = dependencies[nodeId] || [];
        return nodeDeps.every((depId) =>
          this.context.completedNodes.has(depId)
        );
      });
  }

  /**
   * resolve inputs from execution context
   * supports direct inputs, references to outputs of other nodes,
   * and direct workflow inputs
   */
  resolveInputs(
    nodeId: string,
    definition: NodeDefinition
  ): Record<string, any> {
    const resolvedInputs: Record<string, any> = {};

    if (nodeId === "entrypoint") {
      return this.context.workflowInputs;
    }

    if (!definition.inputs) return resolvedInputs;

    for (const [inputName, inputDef] of Object.entries(definition.inputs)) {
      if (inputDef.source) {
        // format source: "nodeId.outputField"
        const [sourceNodeId, sourceOutputField] = inputDef.source.split(".");

        if (!sourceNodeId) {
          logger.warn(
            `invalid source format for input ${inputName} in node ${nodeId}`
          );
          continue;
        }

        // check if source node exists in context
        if (!this.node(sourceNodeId)) {
          logger.warn(
            `source node ${sourceNodeId} not found for input ${inputName} in node ${nodeId}`
          );
          continue;
        }

        // case 1: source specifies an output field (nodeId.outputField)
        if (sourceOutputField) {
          resolvedInputs[inputName] =
            this.node(sourceNodeId)?.output?.[sourceOutputField];
        }
        // case 2: source specifies only a node (nodeId)
        else {
          resolvedInputs[inputName] = this.node(sourceNodeId)?.output;
        }
      }
      // case 3: input direct from workflow (entrypoint)
      else if (this.entrypoint().output?.[inputName] !== undefined) {
        resolvedInputs[inputName] = this.entrypoint().output?.[inputName];
      }
      // case 4: direct value in definition
      else if (inputDef.value !== undefined) {
        resolvedInputs[inputName] = inputDef.value;
      }
    }

    // log if required inputs are missing
    for (const inputName of Object.keys(definition.inputs)) {
      if (resolvedInputs[inputName] === undefined) {
        logger.warn(
          `input ${inputName} for node ${nodeId} could not be resolved`
        );
      }
    }

    return resolvedInputs;
  }
}
