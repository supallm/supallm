import {
  WorkflowDefinition,
  WorkflowExecutionResult,
  WorkflowExecutionOptions,
} from "./types";
import {
  NodeDefinition,
  NodeIOType
} from "../../interfaces/node";
import { NodeManager } from "../node/node-manager";
import { logger } from "../../utils/logger";
import { EventEmitter } from "events";
import { WorkflowEvents, WorkflowExecutorEvents } from "../notifier";
import { IContextService, MemoryContextService, ExecutionContext, NodeExecutionResult } from "../context";

export class WorkflowExecutor extends EventEmitter {
  private readonly nodeManager: NodeManager;
  private readonly contextService: IContextService;

  constructor(nodeManager?: NodeManager, contextService?: IContextService) {
    super();
    this.nodeManager = nodeManager || new NodeManager();
    this.contextService = contextService || new MemoryContextService();
  }

  async execute(
    workflowId: string,
    definition: WorkflowDefinition,
    options: WorkflowExecutionOptions
  ): Promise<WorkflowExecutionResult> {
    const startTime = Date.now();
    
    const context = this.initializeContext(workflowId, definition, options);
    await this.contextService.initialize(workflowId, context);

    let currentContext = await this.contextService.getContext(workflowId);
    if (!currentContext) {
      throw new Error(`failed to initialize context for workflow ${workflowId}`);
    }

    this.emitWorkflowStarted(currentContext);

    try {
      await this.executeWorkflow(workflowId, definition);

      currentContext = await this.contextService.getContext(workflowId);
      if (!currentContext) {
        throw new Error(`context for workflow ${workflowId} not found after execution`);
      }
      
      const output = this.extractFinalOutput(definition, currentContext);
      const executionTime = Date.now() - startTime;

      this.emitWorkflowCompleted(currentContext, output);
      
      await this.contextService.deleteContext(workflowId);
      return {
        workflowId,
        success: true,
        output,
        nodeResults: currentContext.nodeResults,
        executionTime,
      };
    } catch (error) {
      const failedContext = await this.contextService.getContext(workflowId);
      
      if (failedContext) {
        this.emitWorkflowFailed(failedContext, error);
      } else {
        this.emitWorkflowFailed(context, error);
      }
      
      await this.contextService.deleteContext(workflowId);
      const executionTime = Date.now() - startTime;
      return {
        workflowId,
        success: false,
        output: null,
        nodeResults: failedContext?.nodeResults || {},
        error: error instanceof Error ? error.message : String(error),
        executionTime,
      };
    }
  }

  private initializeContext(
    workflowId: string,
    definition: WorkflowDefinition,
    options: WorkflowExecutionOptions
  ): ExecutionContext {
    return {
      workflowId,
      sessionId: options.sessionId,
      triggerId: options.triggerId,
      inputs: options.inputs || {},
      outputs: {},
      nodeResults: {},
      completedNodes: new Set<string>(),
      allNodes: new Set(Object.keys(definition.nodes)),
    };
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
    definition: WorkflowDefinition
  ): Promise<void> {
    const { dependencies } = this.buildDependencyGraph(definition);

    let context = await this.contextService.getContext(workflowId);
    if (!context) {
      throw new Error(`context for workflow ${workflowId} not found during execution`);
    }

    while (context.completedNodes.size < context.allNodes.size) {
      // find nodes ready to execute (all dependencies completed)
      const readyNodes = this.findReadyNodes(context, dependencies);

      if (readyNodes.length === 0) {
        // if no nodes are ready but there are still nodes to complete,
        // we have a circular dependency or unreachable nodes
        if (context.completedNodes.size < context.allNodes.size) {
          this.handleCircularDependency(context, dependencies);
        }
        break;
      }

      const results = await this.executeReadyNodes(workflowId, readyNodes, definition);
      const errors = results.filter((r) => !r.success);
      if (errors.length > 0) {
        throw new Error(
          `Failed to execute nodes: ${errors
            .map((e) => `${e.nodeId}: ${e.error}`)
            .join(", ")}`
        );
      }

      // mark nodes as completed and update the context
      context = await this.contextService.getContext(workflowId);
      if (!context) {
        throw new Error(`context for workflow ${workflowId} not found during node completion`);
      }
      
      for (const result of results) {
        await this.contextService.markNodeCompleted(workflowId, result.nodeId);
      }
      
      // get the updated context for the next iteration
      context = await this.contextService.getContext(workflowId);
      if (!context) {
        throw new Error(`context for workflow ${workflowId} not found after marking nodes completed`);
      }
    }
  }

  private handleCircularDependency(
    context: ExecutionContext,
    dependencies: Record<string, string[]>
  ): never {
    const remainingNodes = Array.from(context.allNodes)
      .filter(nodeId => !context.completedNodes.has(nodeId));
    
    const blockedNodesInfo = remainingNodes.map(nodeId => {
      const nodeDeps = dependencies[nodeId] || [];
      const missingDeps = nodeDeps.filter(depId => !context.completedNodes.has(depId));
      return {
        nodeId,
        missingDeps
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
        // get the current context for node execution
        const context = await this.contextService.getContext(workflowId);
        if (!context) {
          throw new Error(`context for workflow ${workflowId} not found during node execution`);
        }
        
        const output = await this.executeNode(workflowId, nodeId, node, context);
        
        // get the updated context for storing the results
        const updatedContext = await this.contextService.getContext(workflowId);
        if (!updatedContext) {
          throw new Error(`context for workflow ${workflowId} not found after node execution`);
        }
        
        const result: NodeExecutionResult = {
          nodeId,
          success: true,
          output,
          executionTime: 0, // TODO: add execution time tracking
          error: undefined, // undefined instead of null for the type
        };

        // update the context with the node results
        await this.contextService.updateContext(workflowId, {
          nodeResults: { ...updatedContext.nodeResults, [nodeId]: result },
          outputs: { ...updatedContext.outputs, [nodeId]: output }
        });

        return { nodeId, success: true };
      } catch (error) {
        // get the context for updating the results in case of error
        const context = await this.contextService.getContext(workflowId);
        if (!context) {
          logger.error(`context for workflow ${workflowId} not found during error handling`);
          return { nodeId, success: false, error };
        }
        
        const result: NodeExecutionResult = {
          nodeId,
          success: false,
          output: null,
          executionTime: 0,
          error: error instanceof Error ? error.message : String(error),
        };

        // update the context with the error results
        await this.contextService.updateContext(workflowId, {
          nodeResults: { ...context.nodeResults, [nodeId]: result }
        });

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
    context: ExecutionContext
  ): Promise<any> {
    this.emitNodeStarted(nodeId, node, context);

    try {
      const output = await this.nodeManager.executeNode(
        nodeId,
        node,
        context,
        {
          onNodeResult: async (nodeId: string, outputField: string, data: string, type: NodeIOType) => {
            // get the current context for the result event
            const currentContext = await this.contextService.getContext(workflowId);
            if (currentContext) {
              this.emitNodeResult(nodeId, node, outputField, data, type, currentContext);
            } else {
              logger.error(`context for workflow ${workflowId} not found during node result emission`);
            }
          },
        }
      );

      // get the current context for the completion event
      const updatedContext = await this.contextService.getContext(workflowId);
      if (updatedContext) {
        this.emitNodeCompleted(nodeId, node, output, updatedContext);
      }

      return output;
    } catch (error) {
      // get the current context for the failure event
      const updatedContext = await this.contextService.getContext(workflowId);
      if (updatedContext) {
        this.emitNodeFailed(nodeId, node, error, updatedContext);
      }
      
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
