import {
  NodeDefinition,
  NodeResultCallback,
  NodeInput,
  NodeOutput,
  NodeType,
  INode,
} from "../../interfaces/node";

export class ResultNode implements INode {
  type: NodeType;

  constructor() {
    this.type = "result";
  }

  async execute(
    nodeId: string,
    definition: NodeDefinition,
    inputs: NodeInput,
    options: {
      onNodeResult: NodeResultCallback;
    }
  ): Promise<NodeOutput> {
    this.validateInputs(nodeId, definition, inputs);

    // result node is the last node to be executed
    // it collects the results of the previous nodes and formats them as the final result
    // these results will be stored in context.outputs[nodeId] by the workflow executor
    // we just return the resolved inputs as is
    return inputs;
  }

  private validateInputs(
    nodeId: string,
    definition: NodeDefinition,
    resolvedInputs: Record<string, any>
  ): void {
    if (!definition.inputs) return;

    for (const [inputName, inputDef] of Object.entries(definition.inputs)) {
      if (resolvedInputs[inputName] === undefined) {
        throw new Error(
          `missing required input '${inputName}' for node ${nodeId}`
        );
      }

      // type validation if necessary (to implement if needed)
    }
  }
}
