import {
  WorkflowDefinition,
  WorkflowExecutionResult,
  WorkflowExecutionOptions,
} from "./types";
import {
  NodeExecutionResult,
  ExecutionContext,
  NodeDefinition,
  NodeIOType
} from "../../interfaces/node";
import { NodeManager } from "../node/node-manager";
import { logger } from "../../utils/logger";
import { EventEmitter } from "events";
import { WorkflowEvents, WorkflowExecutorEvents } from "../notifier";

export class WorkflowExecutor extends EventEmitter {
  private readonly nodeManager: NodeManager;

  constructor(nodeManager?: NodeManager) {
    super();
    this.nodeManager = nodeManager || new NodeManager();
  }

  async execute(
    workflowId: string,
    definition: WorkflowDefinition,
    options: WorkflowExecutionOptions
  ): Promise<WorkflowExecutionResult> {
    const startTime = Date.now();
    logger.info(`starting execution of workflow ${workflowId}`);

    const context = this.initializeContext(workflowId, definition, options);

    // Emit workflow started event
    this.emitWorkflowStarted(context);

    try {
      // Execute the workflow
      await this.executeWorkflow(definition, context);

      const output = this.extractFinalOutput(definition, context);
      const executionTime = Date.now() - startTime;

      // Emit workflow completed event
      this.emitWorkflowCompleted(context, output);

      return {
        workflowId,
        success: true,
        output,
        nodeResults: context.nodeResults,
        executionTime,
      };
    } catch (error) {
      this.emitWorkflowFailed(context, error);

      const executionTime = Date.now() - startTime;
      return {
        workflowId,
        success: false,
        output: null,
        nodeResults: context.nodeResults,
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

  private emitWorkflowStarted(context: ExecutionContext): void {
    this.emit(WorkflowEvents.WORKFLOW_STARTED, {
      workflowId: context.workflowId,
      triggerId: context.triggerId,
      sessionId: context.sessionId,
      inputs: context.inputs,
    });
  }

  private emitWorkflowCompleted(context: ExecutionContext, result: any): void {
    this.emit(WorkflowEvents.WORKFLOW_COMPLETED, {
      workflowId: context.workflowId,
      triggerId: context.triggerId,
      sessionId: context.sessionId,
      result,
    });
  }

  private emitWorkflowFailed(context: ExecutionContext, error: any): void {
    this.emit(WorkflowEvents.WORKFLOW_FAILED, {
      workflowId: context.workflowId,
      triggerId: context.triggerId,
      sessionId: context.sessionId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  private async executeWorkflow(
    definition: WorkflowDefinition,
    context: ExecutionContext
  ): Promise<void> {
    const { dependencies } = this.buildDependencyGraph(definition);

    while (context.completedNodes.size < context.allNodes.size) {
      // Find nodes ready to execute (all dependencies completed)
      const readyNodes = this.findReadyNodes(context, dependencies);

      if (readyNodes.length === 0) {
        // If no nodes are ready but there are still nodes to complete,
        // we have a circular dependency or unreachable nodes
        if (context.completedNodes.size < context.allNodes.size) {
          this.handleCircularDependency(context, dependencies);
        }
        break;
      }

      const results = await this.executeReadyNodes(readyNodes, definition, context);

      const errors = results.filter((r) => !r.success);
      if (errors.length > 0) {
        throw new Error(
          `error executing nodes: ${errors.map((e) => e.nodeId).join(", ")}`
        );
      }

      // Mark nodes as completed
      for (const result of results) {
        context.completedNodes.add(result.nodeId);
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
        missingDependencies: missingDeps
      };
    });
    
    logger.error(`workflow execution blocked. Remaining nodes: ${JSON.stringify(blockedNodesInfo)}`);
    throw new Error(`circular dependency or unreachable nodes detected in workflow: blocked nodes: ${remainingNodes.join(', ')}`);
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
    readyNodes: string[],
    definition: WorkflowDefinition,
    context: ExecutionContext
  ): Promise<Array<{ nodeId: string; success: boolean; error?: any }>> {
    const nodePromises = readyNodes.map(async (nodeId) => {
      const node = definition.nodes[nodeId];
      const startNodeTime = Date.now();
      
      try {
        const output = await this.executeNode(nodeId, node, context);
        
        // Store result in context
        const executionTime = Date.now() - startNodeTime;
        const result: NodeExecutionResult = {
          nodeId,
          success: true,
          output,
          executionTime,
        };

        context.nodeResults[nodeId] = result;
        context.outputs[nodeId] = output;

        return { nodeId, success: true };
      } catch (error) {
        const executionTime = Date.now() - startNodeTime;
        const result: NodeExecutionResult = {
          nodeId,
          success: false,
          output: null,
          error: error instanceof Error ? error.message : String(error),
          executionTime,
        };

        context.nodeResults[nodeId] = result;
        return { nodeId, success: false, error };
      }
    });

    // Wait for all parallel executions to complete
    return await Promise.all(nodePromises);
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

    // If multiple result nodes, return object with all outputs
    const result: Record<string, any> = {};
    for (const nodeId of resultNodes) {
      result[nodeId] = context.outputs[nodeId];
    }

    return result;
  }

  private async executeNode(
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
            this.emitNodeResult(nodeId, node, outputField, data, type, context);
          },
        }
      );

      this.emitNodeCompleted(nodeId, node, output, context);

      return output;
    } catch (error) {
      this.emitNodeFailed(nodeId, node, error, context);
      throw error;
    }
  }

  private emitNodeStarted(
    nodeId: string,
    node: NodeDefinition,
    context: ExecutionContext
  ): void {
    this.emit(WorkflowEvents.NODE_STARTED, {
      workflowId: context.workflowId,
      triggerId: context.triggerId,
      sessionId: context.sessionId,
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
      workflowId: context.workflowId,
      triggerId: context.triggerId,
      sessionId: context.sessionId,
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
      workflowId: context.workflowId,
      triggerId: context.triggerId,
      sessionId: context.sessionId,
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
      workflowId: context.workflowId,
      triggerId: context.triggerId,
      sessionId: context.sessionId,
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
