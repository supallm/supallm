import { BaseNode } from "./base-node";
import {
  NodeDefinition,
  ExecutionContext,
  NodeResultCallback,
} from "../../interfaces/node";
import { logger } from "../../utils/logger";

export class ResultNode extends BaseNode {
  constructor() {
    super("result");
  }

  async execute(
    nodeId: string,
    definition: NodeDefinition,
    context: ExecutionContext,
    _: {
      onNodeResult: NodeResultCallback;
    }
  ): Promise<Record<string, any>> {
    logger.info(`executing result node ${nodeId}`);

    const resolvedInputs = this.resolveInputs(nodeId, definition, context);
    this.validateInputs(nodeId, definition, resolvedInputs);

    // result node is the last node to be executed
    // it collects the results of the previous nodes and formats them as the final result
    // these results will be stored in context.outputs[nodeId] by the workflow executor
    // we just return the resolved inputs as is
    return resolvedInputs;
  }
}
