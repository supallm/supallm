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
  private nodeManager: NodeManager;
  private currentWorkflowId: string = "";
  private currentSessionId: string = "";
  private currentTriggerId: string = "";

  constructor() {
    super();
    this.nodeManager = new NodeManager();
  }

  async execute(
    workflowId: string,
    definition: WorkflowDefinition,
    options: WorkflowExecutionOptions
  ): Promise<WorkflowExecutionResult> {
    this.currentWorkflowId = workflowId;
    this.currentSessionId = options.sessionId;
    this.currentTriggerId = options.triggerId;

    const startTime = Date.now();
    logger.info(`starting execution of workflow ${workflowId}`);

    this.emit(WorkflowEvents.WORKFLOW_STARTED, {
      workflowId,
      triggerId: this.currentTriggerId,
      sessionId: this.currentSessionId,
      inputs: options.inputs,
    });

    try {
      const context: ExecutionContext = {
        inputs: options.inputs || {},
        outputs: {},
        nodeResults: {},
      };

      const { dependencies } = this.buildDependencyGraph(definition);

      const completedNodes = new Set<string>();
      const allNodes = new Set(Object.keys(definition.nodes));

      while (completedNodes.size < allNodes.size) {
        // find nodes ready to execute (all dependencies completed)
        const readyNodes = Array.from(allNodes)
          .filter((nodeId) => !completedNodes.has(nodeId))
          .filter((nodeId) => {
            const nodeDeps = dependencies[nodeId] || [];
            return nodeDeps.every((depId) => completedNodes.has(depId));
          });

        if (readyNodes.length === 0) {
          if (completedNodes.size < allNodes.size) {
            // should not happen, but just in case
            throw new Error("circular dependency detected in workflow");
          }
          break;
        }

        // execute ready nodes in parallel
        const nodePromises = readyNodes.map(async (nodeId) => {
          const node = definition.nodes[nodeId];
          const startNodeTime = Date.now();
          try {
            const output = await this.executeNode(nodeId, node, context);

            // store result in context
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

        // wait for all parallel executions to complete
        const results = await Promise.all(nodePromises);

        const errors = results.filter((r) => !r.success);
        if (errors.length > 0) {
          throw new Error(
            `error executing nodes: ${errors.map((e) => e.nodeId).join(", ")}`
          );
        }

        // mark nodes as completed
        for (const result of results) {
          completedNodes.add(result.nodeId);
        }
      }

      // extract final output
      const output = this.extractFinalOutput(definition, context);

      const executionTime = Date.now() - startTime;

      // emit workflow completed event
      this.emit(WorkflowEvents.WORKFLOW_COMPLETED, {
        workflowId,
        triggerId: this.currentTriggerId,
        sessionId: this.currentSessionId,
        result: output,
      });

      return {
        workflowId,
        success: true,
        output,
        nodeResults: context.nodeResults,
        executionTime,
      };
    } catch (error) {
      this.emit(WorkflowEvents.WORKFLOW_FAILED, {
        workflowId,
        triggerId: this.currentTriggerId,
        sessionId: this.currentSessionId,
        error: error instanceof Error ? error.message : String(error),
      });

      const executionTime = Date.now() - startTime;
      return {
        workflowId,
        success: false,
        output: null,
        nodeResults: {},
        error: error instanceof Error ? error.message : String(error),
        executionTime,
      };
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
        for (const [inputName, inputDef] of Object.entries(node.inputs)) {
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

  private async executeNode(
    nodeId: string,
    node: NodeDefinition,
    context: ExecutionContext
  ): Promise<any> {
    this.emit(WorkflowEvents.NODE_STARTED, {
      workflowId: this.currentWorkflowId,
      triggerId: this.currentTriggerId,
      sessionId: this.currentSessionId,
      nodeId,
      nodeType: node.type,
      inputs: context.inputs,
    });

    const startNodeTime = Date.now();

    try {
      const output = await this.nodeManager.executeNode(
        nodeId,
        node,
        context,
        {
          onNodeResult: async (nodeId: string, outputField: string, data: string, type: NodeIOType) => {
            this.emit(WorkflowEvents.NODE_RESULT, {
              workflowId: this.currentWorkflowId,
              triggerId: this.currentTriggerId,
              sessionId: this.currentSessionId,
              nodeId,
              nodeType: node.type,
              outputField,
              data,
              type,
            });
          },
        }
      );

      const executionTime = Date.now() - startNodeTime;
      const result: NodeExecutionResult = {
        nodeId,
        success: true,
        output,
        executionTime,
      };

      context.nodeResults[nodeId] = result;
      context.outputs[nodeId] = output;

      this.emit(WorkflowEvents.NODE_COMPLETED, {
        workflowId: this.currentWorkflowId,
        triggerId: this.currentTriggerId,
        sessionId: this.currentSessionId,
        nodeId,
        nodeType: node.type,
        output,
      });

      return output;
    } catch (error) {
      this.emit(WorkflowEvents.NODE_FAILED, {
        workflowId: this.currentWorkflowId,
        triggerId: this.currentTriggerId,
        sessionId: this.currentSessionId,
        nodeId,
        nodeType: node.type,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
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
