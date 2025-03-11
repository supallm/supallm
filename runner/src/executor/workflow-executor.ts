import {
  WorkflowDefinition,
  WorkflowExecutionResult,
  WorkflowExecutionOptions,
} from "../interfaces/workflow";
import {
  NodeDefinition,
  NodeExecutionResult,
  ExecutionContext,
} from "../interfaces/node";
import { NodeManager } from "./node-manager";
import { logger } from "../utils/logger";
import { EventEmitter } from "events";

export class WorkflowExecutor extends EventEmitter {
  private nodeManager: NodeManager;
  private currentWorkflowId: string = "";
  private currentSessionId: string = "";

  constructor() {
    super();
    this.nodeManager = new NodeManager();
  }

  async execute(
    workflowId: string,
    definition: WorkflowDefinition,
    options: WorkflowExecutionOptions = {}
  ): Promise<WorkflowExecutionResult> {
    const startTime = Date.now();
    this.currentWorkflowId = workflowId;
    this.currentSessionId = options.sessionId || "";

    logger.info(`starting execution of workflow ${workflowId}`);

    try {
      // initialize execution context
      const context: ExecutionContext = {
        inputs: options.inputs || {},
        outputs: {},
        nodeResults: {},
        streamOutputs: {},
      };

      // build dependency graph
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
            throw new Error("circular dependency detected in workflow");
          }
          break;
        }

        // execute ready nodes in parallel
        const nodePromises = readyNodes.map(async (nodeId) => {
          const node = definition.nodes[nodeId];

          // node start callback
          if (options.callbacks?.onNodeStart) {
            await options.callbacks.onNodeStart(nodeId, node.type);
          }

          const startNodeTime = Date.now();

          try {
            // execute node with streaming support
            const output = await this.nodeManager.executeNode(
              nodeId,
              node,
              context.inputs,
              context,
              {
                onNodeStream: options.callbacks?.onNodeStream,
              }
            );

            // store result
            const executionTime = Date.now() - startNodeTime;
            const result: NodeExecutionResult = {
              nodeId,
              success: true,
              output,
              executionTime,
            };

            context.nodeResults[nodeId] = result;
            context.outputs[nodeId] = output;

            // node complete callback
            if (options.callbacks?.onNodeComplete) {
              await options.callbacks.onNodeComplete(nodeId, output);
            }

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

            // node error callback
            if (options.callbacks?.onNodeError) {
              await options.callbacks.onNodeError(
                nodeId,
                error instanceof Error ? error : new Error(String(error))
              );
            }

            return { nodeId, success: false, error };
          }
        });

        // wait for all parallel executions to complete
        const results = await Promise.all(nodePromises);

        // check for errors
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
      return {
        workflowId,
        success: true,
        output,
        nodeResults: context.nodeResults,
        executionTime,
      };
    } catch (error) {
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
        for (const input of Object.values(node.inputs)) {
          if (typeof input === "object" && input.source) {
            const sourceNodeId = input.source.split(".")[0];

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
}
