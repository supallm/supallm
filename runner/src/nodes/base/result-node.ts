import { BaseNode } from "./base-node";
import { NodeDefinition, NodeResultCallback } from "../../interfaces/node";
import { ManagedExecutionContext } from "../../services/context";

export class ResultNode extends BaseNode {
  constructor() {
    super("result");
  }

  async execute(
    nodeId: string,
    definition: NodeDefinition,
    managedContext: ManagedExecutionContext,
    callbacks: {
      onNodeResult: NodeResultCallback;
    }
  ): Promise<Record<string, any>> {
    const resolvedInputs = this.resolveInputs(
      nodeId,
      definition,
      managedContext.internal()
    );
    this.validateInputs(nodeId, definition, resolvedInputs);

    // result node is the last node to be executed
    // it collects the results of the previous nodes and formats them as the final result
    // these results will be stored in context.outputs[nodeId] by the workflow executor
    // we just return the resolved inputs as is
    return resolvedInputs;
  }
}
