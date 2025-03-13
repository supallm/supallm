import { BaseNode } from "./base-node";
import { BaseNodeDefinition, ExecutionContext } from "../../interfaces/node";
import { logger } from "../../utils/logger";

export class EntrypointNode extends BaseNode {
  constructor() {
    super("entrypoint");
  }

  async execute(
    nodeId: string,
    definition: BaseNodeDefinition,
    inputs: Record<string, any>,
    context: ExecutionContext,
    callbacks: {
      onNodeStream: (
        nodeId: string,
        outputField: string,
        chunk: string
      ) => Promise<void>;
    }
  ): Promise<any> {
    logger.info(`Executing entrypoint node ${nodeId}`);

    // The entrypoint node simply passes the workflow inputs to the next nodes
    // without transformation
    return { ...context.inputs };
  }
}
