import { BaseNode } from "./base-node";
import {
  NodeDefinition,
  ExecutionContext,
  NodeResultCallback,
} from "../../interfaces/node";
import { logger } from "../../utils/logger";

export class EntrypointNode extends BaseNode {
  constructor() {
    super("entrypoint");
  }

  async execute(
    nodeId: string,
    _: NodeDefinition,
    context: ExecutionContext,
    callbacks: {
      onNodeResult: NodeResultCallback;
    }
  ): Promise<Record<string, any>> {
    logger.info(`Executing entrypoint node ${nodeId}`);

    // entrypoint node is the first node to be executed
    // it takes the global inputs and makes them available to the next nodes
    // these inputs are already available in context.inputs
    // we just return them as is
    // the result will be stored in context.outputs[nodeId] by the workflow executor
    return { ...context.inputs };
  }
}
