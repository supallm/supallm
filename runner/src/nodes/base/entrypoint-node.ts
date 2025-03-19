import {
  NodeDefinition,
  NodeResultCallback,
  NodeInput,
  NodeOutput,
  NodeType,
  INode,
} from "../types";

export class EntrypointNode implements INode {
  type: NodeType;

  constructor() {
    this.type = "entrypoint";
  }

  async execute(
    nodeId: string,
    definition: NodeDefinition,
    inputs: NodeInput,
    options: {
      onNodeResult: NodeResultCallback;
    }
  ): Promise<NodeOutput> {
    // entrypoint node is the first node to be executed
    // it takes the global inputs and makes them available to the next nodes
    // these inputs are already available in context.inputs
    // we just return them as is
    // the result will be stored in context.outputs[nodeId] by the workflow executor
    return { ...inputs };
  }
}
