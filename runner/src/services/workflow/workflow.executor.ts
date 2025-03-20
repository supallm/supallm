import { WorkflowDefinition, WorkflowExecutionOptions } from "./types";
import {
  NodeDefinition,
  NodeInput,
  NodeIOType,
  NodeOutput,
} from "../../nodes/types";
import { NodeManager } from "../node/node-manager";
import { logger } from "../../utils/logger";
import { EventEmitter } from "events";
import { WorkflowEvents, WorkflowExecutorEvents } from "../notifier";
import {
  IContextService,
  ExecutionContext,
  NodeExecutionResult,
  ManagedExecutionContext,
} from "../context";

export class WorkflowExecutor extends EventEmitter {
  private readonly nodeManager: NodeManager;
  private readonly contextService: IContextService;

  constructor(nodeManager: NodeManager, contextService: IContextService) {
    super();
    this.nodeManager = nodeManager;
    this.contextService = contextService;
  }

  async execute(
    workflowId: string,
    definition: WorkflowDefinition,
    options: WorkflowExecutionOptions
  ): Promise<void> {
    let context = await this.contextService.initialize(
      workflowId,
      definition,
      options
    );

    try {
      this.emitWorkflowStarted(context);
      await this.executeWorkflow(context, definition);
      const output = this.extractFinalOutput(definition, context);
      this.emitWorkflowCompleted(context, output);
    } catch (error) {
      logger.error(`error executing workflow ${workflowId}: ${error}`);
      this.emitWorkflowFailed(context, error);
    }
  }

  private async executeWorkflow(
    managedContext: ManagedExecutionContext,
    definition: WorkflowDefinition
  ): Promise<void> {
    const { dependencies } = this.buildDependencyGraph(definition);
    while (
      managedContext.get.completedNodes.size < managedContext.get.allNodes.size
    ) {
      // find nodes ready to execute (all dependencies completed)
      const readyNodes = managedContext.findReadyNodes(dependencies);

      if (readyNodes.length === 0) {
        // if no nodes are ready but there are still nodes to complete,
        // we have a circular dependency or unreachable nodes
        if (
          managedContext.get.completedNodes.size <
          managedContext.get.allNodes.size
        ) {
          this.handleCircularDependency(managedContext.get, dependencies);
        }
        break;
      }

      const results = await this.executeReadyNodes(
        managedContext,
        readyNodes,
        definition
      );
      const errors = results.filter((r) => !r.success);
      if (errors.length > 0) {
        throw new Error(
          `Failed to execute nodes: ${errors
            .map((e) => `${e.nodeId}: ${e.error}`)
            .join(", ")}`
        );
      }

      for (const result of results) {
        await managedContext.markNodeCompleted(result.nodeId);
      }
    }
  }

  private handleCircularDependency(
    context: ExecutionContext,
    dependencies: Record<string, string[]>
  ): never {
    const remainingNodes = Array.from(context.allNodes).filter(
      (nodeId) => !context.completedNodes.has(nodeId)
    );

    const blockedNodesInfo = remainingNodes.map((nodeId) => {
      const nodeDeps = dependencies[nodeId] || [];
      const missingDeps = nodeDeps.filter(
        (depId) => !context.completedNodes.has(depId)
      );
      return {
        nodeId,
        missingDeps,
      };
    });

    throw new Error(
      `circular dependency or unreachable nodes detected: ${JSON.stringify(
        blockedNodesInfo
      )}`
    );
  }

  private async executeReadyNodes(
    managedContext: ManagedExecutionContext,
    readyNodes: string[],
    definition: WorkflowDefinition
  ): Promise<Array<{ nodeId: string; success: boolean; error?: any }>> {
    const nodePromises = readyNodes.map(async (nodeId) => {
      try {
        const node = definition.nodes[nodeId];
        if (!node) {
          logger.error(`node definition not found for nodeId: ${nodeId}`);
          return {
            nodeId,
            success: false,
            error: `node definition not found for nodeId: ${nodeId}`,
          };
        }

        const inputs = managedContext.resolveInputs(nodeId, node);
        const output = await this.executeNode(
          nodeId,
          node,
          inputs,
          managedContext
        );

        const result: NodeExecutionResult = {
          id: nodeId,
          success: true,
          inputs,
          output,
          executionTime: 0,
          error: undefined,
        };

        await managedContext.updateNode(nodeId, result);
        return { nodeId, success: true };
      } catch (error) {
        const result: NodeExecutionResult = {
          id: nodeId,
          success: false,
          inputs: null,
          output: null,
          executionTime: 0,
          error: error instanceof Error ? error.message : String(error),
        };

        await managedContext.updateNode(nodeId, result);
        logger.error(`error executing node ${nodeId}: ${error}`);
        return { nodeId, success: false, error };
      }
    });

    return Promise.all(nodePromises);
  }

  private async executeNode(
    nodeId: string,
    node: NodeDefinition,
    inputs: NodeInput,
    managedContext: ManagedExecutionContext
  ): Promise<NodeOutput> {
    this.emitNodeStarted(nodeId, node, inputs, managedContext);

    try {
      const output = await this.nodeManager.executeNode(nodeId, node, inputs, {
        onNodeResult: async (
          nodeId: string,
          outputField: string,
          data: string,
          type: NodeIOType
        ) => {
          this.emitNodeResult(
            nodeId,
            node,
            outputField,
            data,
            type,
            managedContext
          );
        },
        onNodeLog: async (nodeId: string, message: string) => {
          this.emitNodeLog(nodeId, node.type, message, managedContext);
        },
      });

      this.emitNodeCompleted(nodeId, node, output, managedContext);
      return output;
    } catch (error) {
      logger.error(`error executing node ${nodeId}: ${error}`);
      this.emitNodeFailed(nodeId, node, error, managedContext);
      throw error;
    }
  }

  private buildDependencyGraph(definition: WorkflowDefinition): {
    dependencies: Record<string, string[]>;
  } {
    const dependencies: Record<string, string[]> = {};

    for (const nodeId in definition.nodes) {
      dependencies[nodeId] = [];
    }

    for (const nodeId in definition.nodes) {
      const node = definition.nodes[nodeId];
      if (!node) {
        throw new Error(`node ${nodeId} not found`);
      }

      if (node.inputs) {
        for (const [_, inputDef] of Object.entries(node.inputs)) {
          if (inputDef && inputDef.source) {
            const sourceNodeId = inputDef.source.split(".")[0];

            if (
              dependencies[nodeId] &&
              sourceNodeId &&
              !dependencies[nodeId].includes(sourceNodeId)
            ) {
              dependencies[nodeId].push(sourceNodeId);
            }
          }
        }
      }
    }

    return { dependencies };
  }

  private extractFinalOutput(
    definition: WorkflowDefinition,
    context: ManagedExecutionContext
  ): Record<string, any> | null {
    const resultNodes = context.resultNodes(definition);

    if (resultNodes.length === 1) {
      return context.result().output;
    }

    // if multiple result nodes, return object with all outputs
    const result: Record<string, any> = {};
    for (const node of resultNodes) {
      result[node.id] = node.output;
    }

    return result;
  }

  private createBaseEventData(context: ExecutionContext) {
    return {
      workflowId: context.workflowId,
      triggerId: context.triggerId,
      sessionId: context.sessionId,
    };
  }

  private emitWorkflowStarted(context: ManagedExecutionContext): void {
    this.emit(WorkflowEvents.WORKFLOW_STARTED, {
      ...this.createBaseEventData(context.get),
      inputs: context.get.workflowInputs,
    });
  }

  private emitWorkflowCompleted(
    context: ManagedExecutionContext,
    result: Record<string, any> | null
  ): void {
    this.emit(WorkflowEvents.WORKFLOW_COMPLETED, {
      ...this.createBaseEventData(context.get),
      result,
    });
  }

  private emitWorkflowFailed(
    context: ManagedExecutionContext,
    error: any
  ): void {
    this.emit(WorkflowEvents.WORKFLOW_FAILED, {
      ...this.createBaseEventData(context.get),
      error: error instanceof Error ? error.message : String(error),
    });
  }

  private emitNodeStarted(
    nodeId: string,
    node: NodeDefinition,
    inputs: NodeInput,
    context: ManagedExecutionContext
  ): void {
    this.emit(WorkflowEvents.NODE_STARTED, {
      ...this.createBaseEventData(context.get),
      nodeId,
      nodeType: node.type,
      inputs,
    });
  }

  private emitNodeCompleted(
    nodeId: string,
    node: NodeDefinition,
    output: NodeOutput,
    context: ManagedExecutionContext
  ): void {
    this.emit(WorkflowEvents.NODE_COMPLETED, {
      ...this.createBaseEventData(context.get),
      nodeId,
      nodeType: node.type,
      output,
    });
  }

  private emitNodeFailed(
    nodeId: string,
    node: NodeDefinition,
    error: any,
    context: ManagedExecutionContext
  ): void {
    this.emit(WorkflowEvents.NODE_FAILED, {
      ...this.createBaseEventData(context.get),
      nodeId,
      nodeType: node.type,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  private emitNodeResult(
    nodeId: string,
    node: NodeDefinition,
    outputField: string,
    data: string,
    type: NodeIOType,
    context: ManagedExecutionContext
  ): void {
    this.emit(WorkflowEvents.NODE_RESULT, {
      ...this.createBaseEventData(context.get),
      nodeId,
      nodeType: node.type,
      outputField,
      data,
      type,
    });
  }

  private emitNodeLog(
    nodeId: string,
    nodeType: string,
    message: string,
    context: ManagedExecutionContext
  ): void {
    this.emit(WorkflowEvents.NODE_LOG, {
      ...this.createBaseEventData(context.get),
      nodeId,
      nodeType,
      message,
    });
  }

  override emit<K extends keyof WorkflowExecutorEvents>(
    event: K,
    data: Parameters<WorkflowExecutorEvents[K]>[0]
  ): boolean {
    return super.emit(event, data);
  }

  override on<K extends keyof WorkflowExecutorEvents>(
    event: K,
    listener: WorkflowExecutorEvents[K]
  ): this {
    return super.on(event, listener);
  }
}
