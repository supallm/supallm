import {
  WorkflowDefinition,
  WorkflowExecutionResult,
  WorkflowExecutionOptions,
  ExecutionContext,
} from "../models/workflow";
import { NodeExecutor } from "./node-executor";
import { EventEmitter } from "events";
import { logger } from "../utils/logger";

export class WorkflowExecutor extends EventEmitter {
  private nodeExecutor: NodeExecutor;
  private currentWorkflowId: string = "";
  private currentSessionId: string = "";

  constructor() {
    super();
    this.nodeExecutor = new NodeExecutor();

    this.nodeExecutor.on("nodeStreaming", (data) => {
      this.emit("nodeStreaming", {
        ...data,
        workflowId: this.currentWorkflowId,
        sessionId: this.currentSessionId,
      });
    });

    this.nodeExecutor.on("nodeEndStreaming", (data) => {
      this.emit("nodeEndStreaming", {
        ...data,
        workflowId: this.currentWorkflowId,
        sessionId: this.currentSessionId,
      });
    });
  }

  async execute(
    workflowId: string,
    definition: WorkflowDefinition,
    options: WorkflowExecutionOptions = {}
  ): Promise<WorkflowExecutionResult> {
    this.currentWorkflowId = workflowId;
    this.currentSessionId = options.sessionId || "";
    const startTime = Date.now();

    logger.info(`Starting execution of workflow ${workflowId}`);
    this.emit("workflowStarted", {
      workflowId,
      sessionId: this.currentSessionId,
    });

    try {
      // Execution context
      const context: ExecutionContext = {
        inputs: options.inputs || {},
        outputs: {},
        nodeResults: {},
        credentials: options.credentials || {},
      };

      // Build the dependency graph
      const dependencies = this.buildDependencyGraph(definition);

      // Execute the workflow with implicit parallel execution
      await this.executeWithDependencies(definition, dependencies, context);

      // Determine the final output (result node)
      const resultNode = Object.values(definition.nodes).find(
        (node) => node.type === "result"
      );
      let finalOutput = null;

      if (resultNode) {
        finalOutput = context.outputs[resultNode.id];
      }

      const result: WorkflowExecutionResult = {
        workflowId,
        success: true,
        output: finalOutput,
        nodeResults: context.nodeResults,
        executionTime: Date.now() - startTime,
      };

      this.emit("workflowCompleted", {
        workflowId,
        sessionId: this.currentSessionId,
        output: finalOutput,
      });

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      logger.error(`Error executing workflow ${workflowId}: ${errorMessage}`);

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
        sessionId: this.currentSessionId,
        error: errorMessage,
      });

      return result;
    }
  }

  private buildDependencyGraph(
    definition: WorkflowDefinition
  ): Record<string, string[]> {
    const dependencies: Record<string, string[]> = {};

    // Initialize dependencies for each node
    for (const nodeId in definition.nodes) {
      dependencies[nodeId] = [];
    }

    // Analyze connections to determine dependencies
    for (const connection of definition.connections) {
      const { from, to } = connection;

      if (!dependencies[to].includes(from)) {
        dependencies[to].push(from);
      }
    }

    return dependencies;
  }

  private async executeWithDependencies(
    definition: WorkflowDefinition,
    dependencies: Record<string, string[]>,
    context: ExecutionContext
  ): Promise<void> {
    const executed = new Set<string>();
    const executing = new Set<string>();

    // Function to get nodes ready to be executed
    const getReadyNodes = (): string[] => {
      return Object.keys(dependencies).filter((nodeId) => {
        if (executed.has(nodeId) || executing.has(nodeId)) return false;

        // A node is ready if all its dependencies have been executed
        return dependencies[nodeId].every((depId) => executed.has(depId));
      });
    };

    // Execute until all nodes are processed
    while (true) {
      const readyNodes = getReadyNodes();
      if (readyNodes.length === 0) {
        // If no nodes are ready but some are being executed,
        // wait for them to finish
        if (executing.size > 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          continue;
        }

        // If no nodes are ready and no nodes are being executed,
        // check if all nodes have been executed
        if (executed.size === Object.keys(dependencies).length) {
          break;
        }

        // If some nodes haven't been executed and no nodes are ready,
        // there is probably a cycle
        throw new Error("Cycle detected in workflow or unreachable nodes");
      }

      // Determine the execution mode
      const executionMode =
        definition.configuration.executionMode || "sequential";

      if (executionMode === "sequential") {
        // Execute nodes one by one
        for (const nodeId of readyNodes) {
          await this.executeNode(
            nodeId,
            definition,
            dependencies,
            context,
            executed,
            executing
          );
        }
      } else {
        // Execute nodes in parallel
        await Promise.all(
          readyNodes.map((nodeId) =>
            this.executeNode(
              nodeId,
              definition,
              dependencies,
              context,
              executed,
              executing
            )
          )
        );
      }
    }
  }

  private async executeNode(
    nodeId: string,
    definition: WorkflowDefinition,
    dependencies: Record<string, string[]>,
    context: ExecutionContext,
    executed: Set<string>,
    executing: Set<string>
  ): Promise<void> {
    // Mark the node as being executed
    executing.add(nodeId);

    try {
      // Get the node definition
      const node = definition.nodes[nodeId];

      this.emit("nodeStarted", {
        workflowId: this.currentWorkflowId,
        nodeId,
        sessionId: this.currentSessionId,
      });

      // Resolve the node inputs
      const nodeInputs = this.resolveNodeInputs(nodeId, definition, context);

      // Execute the node
      const result = await this.nodeExecutor.executeNode(
        node,
        nodeInputs,
        context.credentials
      );

      // Store the results
      context.nodeResults[nodeId] = result;
      context.outputs[nodeId] = result.output;

      this.emit("nodeCompleted", {
        workflowId: this.currentWorkflowId,
        nodeId,
        sessionId: this.currentSessionId,
        output: result.output,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      logger.error(`Error executing node ${nodeId}: ${errorMessage}`);

      context.nodeResults[nodeId] = {
        nodeId,
        success: false,
        output: null,
        error: errorMessage,
        executionTime: 0,
      };

      this.emit("nodeFailed", {
        workflowId: this.currentWorkflowId,
        nodeId,
        sessionId: this.currentSessionId,
        error: errorMessage,
      });

      // Stop the execution if the configuration requires it
      if (definition.configuration.errorHandling === "stopOnError") {
        throw new Error(
          `Workflow execution stopped due to error in node ${nodeId}: ${errorMessage}`
        );
      }
    } finally {
      // Mark the node as executed
      executing.delete(nodeId);
      executed.add(nodeId);
    }
  }

  private resolveNodeInputs(
    nodeId: string,
    definition: WorkflowDefinition,
    context: ExecutionContext
  ): Record<string, any> {
    const node = definition.nodes[nodeId];
    const inputs: Record<string, any> = {};

    // Find incoming connections
    const incomingConnections = definition.connections.filter(
      (conn) => conn.to === nodeId
    );

    // For each incoming connection, get the corresponding value
    for (const connection of incomingConnections) {
      const { from, fromPort, toPort } = connection;

      // If the source node is "entrypoint", take the value of the global inputs
      if (definition.nodes[from].type === "entrypoint") {
        const inputName = toPort || fromPort;
        if (inputName && fromPort && context.inputs[fromPort]) {
          inputs[inputName] = context.inputs[fromPort];
        }
      }
      // Otherwise, take the value of the source node output
      else if (context.outputs[from]) {
        const outputValue = fromPort
          ? context.outputs[from][fromPort]
          : context.outputs[from];
        const inputName = toPort || fromPort || "input";

        if (outputValue !== undefined) {
          inputs[inputName] = outputValue;
        }
      }
    }

    // For merge nodes, ensure all inputs are available
    if (node.type === "merge") {
      // Check that all incoming connections have values
      for (const connection of incomingConnections) {
        const { fromPort, toPort } = connection;
        const inputName = toPort || fromPort;

        if (inputName && inputs[inputName] === undefined) {
          throw new Error(
            `Missing input ${inputName} for merge node ${nodeId}`
          );
        }
      }
    }

    return inputs;
  }

  determineExecutionOrder(definition: WorkflowDefinition): string[] {
    const dependencies = this.buildDependencyGraph(definition);
    const visited = new Set<string>();
    const order: string[] = [];

    // Recursive function to visit a node and its dependencies
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;

      // Visit dependencies first
      for (const depId of dependencies[nodeId] || []) {
        visit(depId);
      }

      // Then add this node to the order
      visited.add(nodeId);
      order.push(nodeId);
    };

    // Start with terminal nodes (type "result")
    for (const nodeId in definition.nodes) {
      if (definition.nodes[nodeId].type === "result") {
        visit(nodeId);
      }
    }

    // Ensure all nodes are visited
    for (const nodeId in definition.nodes) {
      visit(nodeId);
    }

    return order;
  }
}
