import { Result } from "typescript-result";
import {
  INode,
  NodeDefinition,
  NodeInput,
  NodeOptions,
  NodeOutput,
  NodeType,
} from "../types";
export class EntrypointNode implements INode {
  type: NodeType;

  constructor() {
    this.type = "entrypoint";
  }

  async execute(
    _nodeId: string,
    _definition: NodeDefinition,
    inputs: NodeInput,
    _options: NodeOptions,
  ): Promise<Result<NodeOutput, Error>> {
    // entrypoint node is the first node to be executed
    // it takes the global inputs and makes them available to the next nodes
    // these inputs are already available in context.inputs
    // we just return them as is
    // the result will be stored in context.outputs[nodeId] by the workflow executor
    return Result.ok({ ...inputs });
  }
}
