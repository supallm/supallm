import { EventEmitter } from "events";
import { Result } from "typescript-result";
import {
  NodeDefinition,
  NodeInput,
  NodeIOType,
  NodeOutput,
} from "../../nodes/types";
import { logger } from "../../utils/logger";
import {
  ExecutionContext,
  IContextService,
  ManagedExecutionContext,
  NodeExecutionResult,
} from "../context";
import { NodeManager } from "../node/node-manager";
import { WorkflowEvents, WorkflowExecutorEvents } from "../notifier";
import { WorkflowDefinition, WorkflowExecutionOptions } from "./types";

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
    options: WorkflowExecutionOptions,
  ): Promise<void> {
    let context = await this.contextService.initialize(
      workflowId,
      definition,
      options,
    );

    try {
      this.emitWorkflowStarted(context);

      const [output, outputError] = (
        await this.executeWorkflow(context, definition)
      ).toTuple();
      if (outputError) {
        throw outputError;
      }

      this.emitWorkflowCompleted(context, output);
    } catch (error) {
      logger.error(`error executing workflow ${workflowId}: ${error}`);
      // TODO: handle error
      this.emitWorkflowFailed(context, error as Error);
    }
  }

  private async executeWorkflow(
    managedContext: ManagedExecutionContext,
    definition: WorkflowDefinition,
  ): Promise<Result<Record<string, any> | null, Error>> {
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
          const circular = this.handleCircularDependency(
            managedContext.get,
            dependencies,
          );
          if (circular.isError()) {
            return Result.error(circular.error);
          }
        }
        break;
      }

      const results = await this.executeReadyNodes(
        managedContext,
        readyNodes,
        definition,
      );
      const errors = results.filter((r) => !r.success);
      if (errors.length > 0) {
        return Result.error(
          new Error(
            `failed to execute nodes: ${errors
              .map((e) => `${e.nodeId}: ${e.error}`)
              .join(", ")}`,
          ),
        );
      }

      for (const result of results) {
        await managedContext.markNodeCompleted(result.nodeId);
      }
    }

    return Result.ok(this.extractFinalOutput(definition, managedContext));
  }

  private handleCircularDependency(
    context: ExecutionContext,
    dependencies: Record<string, string[]>,
  ): Result<void, Error> {
    const remainingNodes = Array.from(context.allNodes).filter(
      (nodeId) => !context.completedNodes.has(nodeId),
    );

    const blockedNodesInfo = remainingNodes.map((nodeId) => {
      const nodeDeps = dependencies[nodeId] || [];
      const missingDeps = nodeDeps.filter(
        (depId) => !context.completedNodes.has(depId),
      );
      return {
        nodeId,
        missingDeps,
      };
    });

    return Result.error(
      new Error(
        `circular dependency or unreachable nodes detected: ${JSON.stringify(
          blockedNodesInfo,
        )}`,
      ),
    );
  }

  private async executeReadyNodes(
    managedContext: ManagedExecutionContext,
    readyNodes: string[],
    definition: WorkflowDefinition,
  ): Promise<Array<{ nodeId: string; success: boolean; error?: any }>> {
    const nodePromises = readyNodes.map(async (nodeId) => {
      const node = definition.nodes[nodeId];
      if (!node) {
        return {
          nodeId,
          success: false,
          error: `node definition not found for nodeId: ${nodeId}`,
        };
      }

      const inputs = managedContext.resolveInputs(nodeId, node);
      const [output, outputError] = (
        await this.executeNode(nodeId, node, inputs, managedContext)
      ).toTuple();

      const success = outputError ? false : true;
      const result: NodeExecutionResult = {
        id: nodeId,
        success,
        inputs,
        output,
        executionTime: 0,
        error: outputError ? outputError.message : undefined,
      };

      await managedContext.updateNode(nodeId, result);
      return { nodeId, success, error: outputError };
    });

    return Promise.all(nodePromises);
  }

  private async executeNode(
    nodeId: string,
    node: NodeDefinition,
    inputs: NodeInput,
    managedContext: ManagedExecutionContext,
  ): Promise<Result<NodeOutput, Error>> {
    this.emitNodeStarted(nodeId, node, inputs, managedContext);

    const [output, outputError] = (
      await this.nodeManager.executeNode(nodeId, node, inputs, {
        sessionId: managedContext.get.sessionId,
        onNodeResult: async (
          nodeId: string,
          outputField: string,
          data: string,
          type: NodeIOType,
        ) => {
          this.emitNodeResult(
            nodeId,
            node,
            outputField,
            data,
            type,
            managedContext,
          );
        },
        onAgentNotification: async (
          nodeId: string,
          outputField: string,
          data: string,
          type: NodeIOType,
        ) => {
          this.emitAgentNotification(
            nodeId,
            node,
            outputField,
            data,
            type,
            managedContext,
          );
        },
        onNodeLog: async (nodeId: string, message: string) => {
          this.emitNodeLog(nodeId, node.type, message, managedContext);
        },
      })
    ).toTuple();

    if (outputError) {
      this.emitNodeFailed(nodeId, node, outputError, managedContext);
      return Result.error(outputError);
    }

    this.emitNodeCompleted(nodeId, node, output, managedContext);
    return Result.ok(output);
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
    context: ManagedExecutionContext,
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
    result: Record<string, any> | null,
  ): void {
    this.emit(WorkflowEvents.WORKFLOW_COMPLETED, {
      ...this.createBaseEventData(context.get),
      result,
    });
  }

  private emitWorkflowFailed(
    context: ManagedExecutionContext,
    error: Error,
  ): void {
    this.emit(WorkflowEvents.WORKFLOW_FAILED, {
      ...this.createBaseEventData(context.get),
      error: error.message,
    });
  }

  private emitNodeStarted(
    nodeId: string,
    node: NodeDefinition,
    inputs: NodeInput,
    context: ManagedExecutionContext,
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
    context: ManagedExecutionContext,
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
    error: Error,
    context: ManagedExecutionContext,
  ): void {
    this.emit(WorkflowEvents.NODE_FAILED, {
      ...this.createBaseEventData(context.get),
      nodeId,
      nodeType: node.type,
      error: error.message,
    });
  }

  private emitNodeResult(
    nodeId: string,
    node: NodeDefinition,
    outputField: string,
    data: string,
    type: NodeIOType,
    context: ManagedExecutionContext,
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

  private emitAgentNotification(
    nodeId: string,
    node: NodeDefinition,
    outputField: string,
    data: string,
    type: NodeIOType,
    context: ManagedExecutionContext,
  ): void {
    this.emit(WorkflowEvents.AGENT_NOTIFICATION, {
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
    context: ManagedExecutionContext,
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
    data: Parameters<WorkflowExecutorEvents[K]>[0],
  ): boolean {
    return super.emit(event, data);
  }

  override on<K extends keyof WorkflowExecutorEvents>(
    event: K,
    listener: WorkflowExecutorEvents[K],
  ): this {
    return super.on(event, listener);
  }
}
