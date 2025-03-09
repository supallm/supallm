import {
  WorkflowDefinition,
  WorkflowExecutionResult,
  WorkflowExecutionOptions,
  NodeExecutionResult,
} from "../models/workflow";
import { NodeExecutor } from "./node-executor";
import { EventEmitter } from "events";
import { logger } from "../utils/logger";

export class WorkflowExecutor extends EventEmitter {
  private nodeExecutor: NodeExecutor;

  constructor() {
    super();
    this.nodeExecutor = new NodeExecutor();
  }

  async execute(
    workflowId: string,
    definition: WorkflowDefinition,
    options: WorkflowExecutionOptions = {}
  ): Promise<WorkflowExecutionResult> {
    const startTime = Date.now();
    logger.info(`Starting execution of workflow ${workflowId}`);

    this.emit("workflowStarted", { workflowId });

    try {
      // Validate workflow definition
      this.validateWorkflow(definition);

      // Initialize execution context
      const context = {
        inputs: options.inputs || {},
        outputs: {} as Record<string, any>,
        nodeResults: {} as Record<string, NodeExecutionResult>,
      };

      // Determine execution order based on connections
      const executionOrder = this.determineExecutionOrder(definition);

      // Execute nodes in order
      for (const nodeId of executionOrder) {
        const node = definition.nodes[nodeId];

        this.emit("nodeStarted", { workflowId, nodeId });

        try {
          // Get input values for this node from previous nodes
          const nodeInputs = this.resolveNodeInputs(
            nodeId,
            definition,
            context
          );

          // Execute the node
          const result = await this.nodeExecutor.executeNode(node, nodeInputs);

          // Store the result
          context.nodeResults[nodeId] = result;
          context.outputs[nodeId] = result.output;

          this.emit("nodeCompleted", {
            workflowId,
            nodeId,
            output: result.output,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          context.nodeResults[nodeId] = {
            nodeId,
            success: false,
            output: null,
            error: errorMessage,
            executionTime: 0,
          };

          this.emit("nodeFailed", {
            workflowId,
            nodeId,
            error: errorMessage,
          });

          if (definition.configuration.errorHandling === "stopOnError") {
            throw new Error(`Node ${nodeId} execution failed: ${errorMessage}`);
          }
        }
      }

      // Determine final output
      const finalOutput = this.determineFinalOutput(definition, context);

      const result: WorkflowExecutionResult = {
        workflowId,
        success: true,
        output: finalOutput,
        nodeResults: context.nodeResults,
        executionTime: Date.now() - startTime,
      };

      this.emit("workflowCompleted", {
        workflowId,
        output: finalOutput,
      });

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      const result: WorkflowExecutionResult = {
        workflowId,
        success: false,
        output: null,
        nodeResults: {},
        error: errorMessage,
        executionTime: Date.now() - startTime,
      };

      this.emit("workflowFailed", {
        workflowId,
        error: errorMessage,
      });

      return result;
    }
  }

  private validateWorkflow(definition: WorkflowDefinition): void {
    // Ensure workflow has nodes
    if (!definition.nodes || Object.keys(definition.nodes).length === 0) {
      throw new Error("Workflow must have at least one node");
    }

    // Ensure all connections reference valid nodes
    for (const connection of definition.connections) {
      if (!definition.nodes[connection.from]) {
        throw new Error(
          `Connection references non-existent source node: ${connection.from}`
        );
      }
      if (!definition.nodes[connection.to]) {
        throw new Error(
          `Connection references non-existent target node: ${connection.to}`
        );
      }
    }
  }

  private determineExecutionOrder(definition: WorkflowDefinition): string[] {
    // For sequential execution, we need to determine a topological sort
    const nodes = Object.keys(definition.nodes);
    const adjacencyList: Record<string, string[]> = {};

    // Initialize adjacency list
    for (const nodeId of nodes) {
      adjacencyList[nodeId] = [];
    }

    // Build adjacency list from connections
    for (const connection of definition.connections) {
      adjacencyList[connection.from].push(connection.to);
    }

    // Perform topological sort
    const visited = new Set<string>();
    const temp = new Set<string>();
    const order: string[] = [];

    function visit(nodeId: string) {
      if (temp.has(nodeId)) {
        throw new Error(`Workflow contains a cycle involving node: ${nodeId}`);
      }
      if (!visited.has(nodeId)) {
        temp.add(nodeId);
        for (const neighbor of adjacencyList[nodeId]) {
          visit(neighbor);
        }
        temp.delete(nodeId);
        visited.add(nodeId);
        order.unshift(nodeId);
      }
    }

    // Visit all nodes
    for (const nodeId of nodes) {
      if (!visited.has(nodeId)) {
        visit(nodeId);
      }
    }

    return order;
  }

  private resolveNodeInputs(
    nodeId: string,
    definition: WorkflowDefinition,
    context: { outputs: Record<string, any>; inputs: Record<string, any> }
  ): Record<string, any> {
    const inputs: Record<string, any> = {};

    // Find all connections where this node is the target
    const incomingConnections = definition.connections.filter(
      (conn) => conn.to === nodeId
    );

    for (const connection of incomingConnections) {
      const sourceNodeId = connection.from;
      const sourceOutput = context.outputs[sourceNodeId];

      // If the connection specifies ports, use them to determine which part of the output to use
      if (
        connection.fromPort &&
        sourceOutput &&
        typeof sourceOutput === "object"
      ) {
        inputs[connection.toPort || "input"] =
          sourceOutput[connection.fromPort] || sourceOutput;
      } else {
        inputs[connection.toPort || "input"] = sourceOutput;
      }
    }

    // Add global inputs if this is a start node
    if (incomingConnections.length === 0) {
      Object.assign(inputs, context.inputs);
    }

    return inputs;
  }

  private determineFinalOutput(
    definition: WorkflowDefinition,
    context: { outputs: Record<string, any> }
  ): any {
    // Find terminal nodes (nodes with no outgoing connections)
    const terminalNodes = Object.keys(definition.nodes).filter((nodeId) => {
      return !definition.connections.some((conn) => conn.from === nodeId);
    });

    if (terminalNodes.length === 1) {
      // If there's only one terminal node, use its output as the workflow output
      return context.outputs[terminalNodes[0]];
    } else if (terminalNodes.length > 1) {
      // If there are multiple terminal nodes, combine their outputs
      const output: Record<string, any> = {};
      for (const nodeId of terminalNodes) {
        output[nodeId] = context.outputs[nodeId];
      }
      return output;
    }

    // If there are no terminal nodes (e.g., in a cycle), return all outputs
    return context.outputs;
  }
}
