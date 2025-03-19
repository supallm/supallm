import {
  WorkflowDefinition,
  WorkflowExecutionResult,
  WorkflowExecutionOptions,
} from "./types";
import { NodeDefinition, NodeIOType } from "../../interfaces/node";
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
  ): Promise<WorkflowExecutionResult> {
    const startTime = Date.now();
    let context = await this.contextService.initialize(
      workflowId,
      definition,
      options
    );
    try {
      this.emitWorkflowStarted(context.internal());

      await this.executeWorkflow(workflowId, context, definition);

      const output = this.extractFinalOutput(definition, context.internal());
      const executionTime = Date.now() - startTime;

      this.emitWorkflowCompleted(context.internal(), output);
      return {
        workflowId,
        success: true,
        output,
        nodeResults: context.internal().nodeResults,
        executionTime,
      };
    } catch (error) {
      this.emitWorkflowFailed(context.internal(), error);
      const executionTime = Date.now() - startTime;
      return {
        workflowId,
        success: false,
        output: null,
        nodeResults: context.internal().nodeResults,
        error: error instanceof Error ? error.message : String(error),
        executionTime,
      };
    }
  }

  private createBaseEventData(context: ExecutionContext) {
    return {
      workflowId: context.workflowId,
      triggerId: context.triggerId,
      sessionId: context.sessionId,
    };
  }

  private emitWorkflowStarted(context: ExecutionContext): void {
    this.emit(WorkflowEvents.WORKFLOW_STARTED, {
      ...this.createBaseEventData(context),
      inputs: context.inputs,
    });
  }

  private emitWorkflowCompleted(context: ExecutionContext, result: any): void {
    this.emit(WorkflowEvents.WORKFLOW_COMPLETED, {
      ...this.createBaseEventData(context),
      result,
    });
  }

  private emitWorkflowFailed(context: ExecutionContext, error: any): void {
    this.emit(WorkflowEvents.WORKFLOW_FAILED, {
      ...this.createBaseEventData(context),
      error: error instanceof Error ? error.message : String(error),
    });
  }

  private async executeWorkflow(
    workflowId: string,
    managedContext: ManagedExecutionContext,
    definition: WorkflowDefinition
  ): Promise<void> {
    const { dependencies } = this.buildDependencyGraph(definition);

    while (
      managedContext.internal().completedNodes.size <
      managedContext.internal().allNodes.size
    ) {
      // find nodes ready to execute (all dependencies completed)
      const readyNodes = this.findReadyNodes(
        managedContext.internal(),
        dependencies
      );

      if (readyNodes.length === 0) {
        // if no nodes are ready but there are still nodes to complete,
        // we have a circular dependency or unreachable nodes
        if (
          managedContext.internal().completedNodes.size <
          managedContext.internal().allNodes.size
        ) {
          this.handleCircularDependency(
            managedContext.internal(),
            dependencies
          );
        }
        break;
      }

      const results = await this.executeReadyNodes(
        workflowId,
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

  private findReadyNodes(
    context: ExecutionContext,
    dependencies: Record<string, string[]>
  ): string[] {
    return Array.from(context.allNodes)
      .filter((nodeId) => !context.completedNodes.has(nodeId))
      .filter((nodeId) => {
        const nodeDeps = dependencies[nodeId] || [];
        return nodeDeps.every((depId) => context.completedNodes.has(depId));
      });
  }

  private async executeReadyNodes(
    workflowId: string,
    managedContext: ManagedExecutionContext,
    readyNodes: string[],
    definition: WorkflowDefinition
  ): Promise<Array<{ nodeId: string; success: boolean; error?: any }>> {
    const nodePromises = readyNodes.map(async (nodeId) => {
      const node = definition.nodes[nodeId];
      if (!node) {
        logger.error(`node definition not found for nodeId: ${nodeId}`);
        return {
          nodeId,
          success: false,
          error: `node definition not found for nodeId: ${nodeId}`,
        };
      }

      try {
        const output = await this.executeNode(
          workflowId,
          nodeId,
          node,
          managedContext
        );

        const result: NodeExecutionResult = {
          nodeId,
          success: true,
          output,
          executionTime: 0,
          error: undefined,
        };

        await managedContext.updateNodeResults(nodeId, result);
        await managedContext.updateOutputs(nodeId, output);

        return { nodeId, success: true };
      } catch (error) {
        const result: NodeExecutionResult = {
          nodeId,
          success: false,
          output: null,
          executionTime: 0,
          error: error instanceof Error ? error.message : String(error),
        };

        // update the context with the error results
        await managedContext.updateNodeResults(nodeId, result);
        logger.error(`error executing node ${nodeId}: ${error}`);
        return { nodeId, success: false, error };
      }
    });

    return Promise.all(nodePromises);
  }

  private async executeNode(
    workflowId: string,
    nodeId: string,
    node: NodeDefinition,
    managedContext: ManagedExecutionContext
  ): Promise<any> {
    this.emitNodeStarted(nodeId, node, managedContext.internal());

    try {
      const output = await this.nodeManager.executeNode(
        nodeId,
        node,
        managedContext,
        {
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
              managedContext.internal()
            );
          },
        }
      );

      this.emitNodeCompleted(nodeId, node, output, managedContext.internal());
      return output;
    } catch (error) {
      this.emitNodeFailed(nodeId, node, error, managedContext.internal());
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

      if (node.inputs) {
        for (const [_, inputDef] of Object.entries(node.inputs)) {
          if (inputDef && inputDef.source) {
            const sourceNodeId = inputDef.source.split(".")[0];

            if (!dependencies[nodeId].includes(sourceNodeId)) {
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
    context: ExecutionContext
  ): any {
    const resultNodes = Object.entries(definition.nodes)
      .filter(([_, node]) => node.type === "result")
      .map(([id, _]) => id);

    if (resultNodes.length === 0) {
      return context.outputs;
    }

    if (resultNodes.length === 1) {
      return context.outputs[resultNodes[0]];
    }

    // if multiple result nodes, return object with all outputs
    const result: Record<string, any> = {};
    for (const nodeId of resultNodes) {
      result[nodeId] = context.outputs[nodeId];
    }

    return result;
  }

  private emitNodeStarted(
    nodeId: string,
    node: NodeDefinition,
    context: ExecutionContext
  ): void {
    this.emit(WorkflowEvents.NODE_STARTED, {
      ...this.createBaseEventData(context),
      nodeId,
      nodeType: node.type,
      inputs: context.inputs,
    });
  }

  private emitNodeCompleted(
    nodeId: string,
    node: NodeDefinition,
    output: any,
    context: ExecutionContext
  ): void {
    this.emit(WorkflowEvents.NODE_COMPLETED, {
      ...this.createBaseEventData(context),
      nodeId,
      nodeType: node.type,
      output,
    });
  }

  private emitNodeFailed(
    nodeId: string,
    node: NodeDefinition,
    error: any,
    context: ExecutionContext
  ): void {
    this.emit(WorkflowEvents.NODE_FAILED, {
      ...this.createBaseEventData(context),
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
    context: ExecutionContext
  ): void {
    this.emit(WorkflowEvents.NODE_RESULT, {
      ...this.createBaseEventData(context),
      nodeId,
      nodeType: node.type,
      outputField,
      data,
      type,
    });
  }

  emit<K extends keyof WorkflowExecutorEvents>(
    event: K,
    data: Parameters<WorkflowExecutorEvents[K]>[0]
  ): boolean {
    return super.emit(event, data);
  }

  on<K extends keyof WorkflowExecutorEvents>(
    event: K,
    listener: WorkflowExecutorEvents[K]
  ): this {
    return super.on(event, listener);
  }
}
