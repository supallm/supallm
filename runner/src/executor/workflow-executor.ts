import {
  WorkflowDefinition,
  WorkflowExecutionResult,
  WorkflowExecutionOptions,
} from "../interfaces/workflow";
import {
  NodeExecutionResult,
  ExecutionContext,
  NodeDefinition,
} from "../interfaces/node";
import { NodeManager } from "./node-manager";
import { logger } from "../utils/logger";
import { EventEmitter } from "events";

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

    // emit workflow started event
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
          const startNodeTime = Date.now();
          try {
            // execute node with streaming support
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
        context.inputs,
        context,
        {
          onNodeStream: async (nodeId, outputField, data) => {
            this.emit(WorkflowEvents.NODE_STREAMING, {
              workflowId: this.currentWorkflowId,
              triggerId: this.currentTriggerId,
              sessionId: this.currentSessionId,
              nodeId,
              nodeType: node.type,
              outputField,
              data,
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

export const WorkflowEvents = {
  WORKFLOW_STARTED: "workflow:started",
  WORKFLOW_COMPLETED: "workflow:completed",
  WORKFLOW_FAILED: "workflow:failed",

  NODE_STARTED: "node:started",
  NODE_COMPLETED: "node:completed",
  NODE_FAILED: "node:failed",
  NODE_STREAMING: "node:streaming",
} as const;

interface BaseEventData {
  workflowId: string;
  sessionId: string;
  triggerId: string;
}

interface BaseNodeEvent extends BaseEventData {
  nodeId: string;
  nodeType: string;
}

interface WorkflowStartedEvent extends BaseEventData {
  inputs: Record<string, any>;
}

interface WorkflowCompletedEvent extends BaseEventData {
  result: any;
}

interface WorkflowFailedEvent extends BaseEventData {
  error: string;
}

interface NodeStartedEvent extends BaseNodeEvent {
  inputs: Record<string, any>;
}

interface NodeStreamingEvent extends BaseNodeEvent {
  outputField: string;
  data: string;
}

interface NodeCompletedEvent extends BaseNodeEvent {
  output: any;
}

interface NodeFailedEvent extends BaseNodeEvent {
  error: string;
}

interface WorkflowExecutorEvents {
  [WorkflowEvents.WORKFLOW_STARTED]: (event: WorkflowStartedEvent) => void;
  [WorkflowEvents.WORKFLOW_COMPLETED]: (event: WorkflowCompletedEvent) => void;
  [WorkflowEvents.WORKFLOW_FAILED]: (event: WorkflowFailedEvent) => void;
  [WorkflowEvents.NODE_STARTED]: (event: NodeStartedEvent) => void;
  [WorkflowEvents.NODE_STREAMING]: (event: NodeStreamingEvent) => void;
  [WorkflowEvents.NODE_COMPLETED]: (event: NodeCompletedEvent) => void;
  [WorkflowEvents.NODE_FAILED]: (event: NodeFailedEvent) => void;
}
