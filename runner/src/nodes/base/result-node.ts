import { BaseNode } from "./base-node";
import { BaseNodeDefinition, ExecutionContext } from "../../interfaces/node";
import { logger } from "../../utils/logger";

export class ResultNode extends BaseNode {
  constructor() {
    super("result");
  }

  async execute(
    nodeId: string,
    definition: BaseNodeDefinition,
    inputs: Record<string, any>,
    context: ExecutionContext,
    callbacks?: {
      onNodeStream?: (
        nodeId: string,
        outputField: string,
        chunk: string
      ) => Promise<void>;
    }
  ): Promise<any> {
    logger.info(`executing result node ${nodeId}`);

    // resolve inputs from previous nodes
    const resolvedInputs = await this.resolveInputs(definition, context);

    // validate inputs
    this.validateInputs(nodeId, definition, resolvedInputs);

    // The result node simply returns the inputs it receives
    // It can be used to format or filter the final results
    return resolvedInputs;
  }
}
