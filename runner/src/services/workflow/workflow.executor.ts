import { EventEmitter } from "events";
import { Result } from "typescript-result";
import { NodeDefinition, NodeInput, NodeOutput } from "../../nodes/types";
import { logger } from "../../utils/logger";
import {
  ExecutionContext,
  IContextService,
  ManagedExecutionContext,
  NodeExecutionResult,
} from "../context";
import { NodeManager } from "../node/node-manager";
import { WorkflowEvent, WorkflowEvents, WorkflowEventType } from "../notifier";
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
      await this.emitEvent(WorkflowEvents.WORKFLOW_STARTED, context, {
        inputs: context.get.workflowInputs,
      });

      const [output, outputError] = (
        await this.executeWorkflow(context, definition)
      ).toTuple();
      if (outputError) {
        throw outputError;
      }

      await this.emitEvent(WorkflowEvents.WORKFLOW_COMPLETED, context, {
        result: output,
      });
    } catch (error) {
      logger.error(`error executing workflow ${workflowId}: ${error}`);
      await this.emitEvent(WorkflowEvents.WORKFLOW_FAILED, context, {
        error: (error as Error).message,
      });
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
    await this.emitEvent(WorkflowEvents.NODE_STARTED, managedContext, {
      nodeId,
      nodeType: node.type,
      inputs,
    });

    const [output, outputError] = (
      await this.nodeManager.executeNode(nodeId, node, inputs, {
        sessionId: managedContext.get.sessionId,
        onEvent: async (type, data) => {
          const { nodeId: eventNodeId, ...eventData } = data;
          await this.emitEvent(type, managedContext, {
            nodeId: eventNodeId ?? nodeId,
            nodeType: node.type,
            ...eventData,
          } as unknown as Omit<
            WorkflowEvent<typeof type>,
            "type" | "workflowId" | "triggerId" | "sessionId"
          >);
        },
      })
    ).toTuple();

    if (outputError) {
      await this.emitEvent(WorkflowEvents.NODE_FAILED, managedContext, {
        nodeId,
        nodeType: node.type,
        error: outputError.message,
      });
      return Result.error(outputError);
    }

    await this.emitEvent(WorkflowEvents.NODE_COMPLETED, managedContext, {
      nodeId,
      nodeType: node.type,
      inputs,
      output,
    });
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

  private async emitEvent<T extends WorkflowEventType>(
    eventType: T,
    context: ManagedExecutionContext,
    eventData: Omit<
      WorkflowEvent<T>,
      "type" | "workflowId" | "triggerId" | "sessionId"
    >,
  ): Promise<void> {
    const baseEvent = {
      type: eventType,
      ...this.createBaseEventData(context.get),
    };

    const isNodeEvent =
      eventType === WorkflowEvents.NODE_STARTED ||
      eventType === WorkflowEvents.NODE_COMPLETED ||
      eventType === WorkflowEvents.NODE_FAILED ||
      eventType === WorkflowEvents.TOOL_STARTED ||
      eventType === WorkflowEvents.TOOL_COMPLETED ||
      eventType === WorkflowEvents.TOOL_FAILED ||
      eventType === WorkflowEvents.NODE_RESULT ||
      eventType === WorkflowEvents.NODE_LOG ||
      eventType === WorkflowEvents.AGENT_NOTIFICATION;

    // Extract common fields
    const { nodeId, nodeType, ...specificData } = eventData as any;

    // For local event emission and backend publication
    const event = {
      ...baseEvent,
      data: {
        ...(isNodeEvent ? { nodeId, nodeType } : {}),
        ...specificData,
      },
    } as unknown as WorkflowEvent<T>;

    this.emit(eventType, event);
  }

  override emit<T extends WorkflowEventType>(
    event: T,
    data: WorkflowEvent<T>,
  ): boolean {
    return super.emit(event, data);
  }

  override on<T extends WorkflowEventType>(
    event: T,
    listener: (event: WorkflowEvent<T>) => void | Promise<void>,
  ): this {
    return super.on(event, listener);
  }
}
