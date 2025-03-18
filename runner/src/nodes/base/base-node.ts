import {
  NodeType,
  NodeDefinition,
  INode,
  NodeResultCallback,
} from "../../interfaces/node";
import { ExecutionContext } from "../../services/context";
import { logger } from "../../utils/logger";

export abstract class BaseNode implements INode {
  type: NodeType;

  constructor(type: NodeType) {
    this.type = type;
  }

  abstract execute(
    nodeId: string,
    definition: NodeDefinition,
    context: ExecutionContext,
    options: {
      onNodeResult: NodeResultCallback;
    }
  ): Promise<any>;

  /**
   * validate inputs against node definition
   * check if all required inputs are present
   */
  protected validateInputs(
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

  /**
   * resolve inputs from execution context
   * supports direct inputs, references to outputs of other nodes,
   * and direct workflow inputs
   */
  protected resolveInputs(
    nodeId: string,
    definition: NodeDefinition,
    context: ExecutionContext
  ): Record<string, any> {
    const resolvedInputs: Record<string, any> = {};

    if (!definition.inputs) return resolvedInputs;

    for (const [inputName, inputDef] of Object.entries(definition.inputs)) {
      if (inputDef.source) {
        // format source: "nodeId.outputField"
        const [sourceNodeId, sourceOutputField] = inputDef.source.split(".");

        if (!sourceNodeId) {
          logger.warn(
            `invalid source format for input ${inputName} in node ${nodeId}`
          );
          continue;
        }

        // check if source node exists in context
        if (!context.outputs[sourceNodeId]) {
          logger.warn(
            `source node ${sourceNodeId} not found for input ${inputName} in node ${nodeId}`
          );
          continue;
        }

        // case 1: source specifies an output field (nodeId.outputField)
        if (sourceOutputField) {
          resolvedInputs[inputName] =
            context.outputs[sourceNodeId]?.[sourceOutputField];
        }
        // case 2: source specifies only a node (nodeId)
        else {
          resolvedInputs[inputName] = context.outputs[sourceNodeId];
        }
      }
      // case 3: input direct from workflow (entrypoint)
      else if (context.inputs[inputName] !== undefined) {
        resolvedInputs[inputName] = context.inputs[inputName];
      }
      // case 4: direct value in definition
      else if (inputDef.value !== undefined) {
        resolvedInputs[inputName] = inputDef.value;
      }
    }

    // log if required inputs are missing
    for (const inputName of Object.keys(definition.inputs)) {
      if (resolvedInputs[inputName] === undefined) {
        logger.warn(
          `input ${inputName} for node ${nodeId} could not be resolved`
        );
      }
    }

    return resolvedInputs;
  }
}
