import { Result } from "typescript-result";
import {
  INode,
  NodeDefinition,
  NodeInput,
  NodeOptions,
  NodeOutput,
  NodeType,
} from "../types";
export class ResultNode implements INode {
  type: NodeType;

  constructor() {
    this.type = "result";
  }

  async execute(
    _nodeId: string,
    _definition: NodeDefinition,
    inputs: NodeInput,
    _options: NodeOptions,
  ): Promise<Result<NodeOutput, Error>> {
    // result node is the last node to be executed
    // it collects the results of the previous nodes and formats them as the final result
    // these results will be stored in context.outputs[nodeId] by the workflow executor
    // we just return the resolved inputs as is
    return Result.ok(inputs);
  }
}
