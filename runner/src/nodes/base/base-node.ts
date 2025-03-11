import {
  INode,
  NodeType,
  NodeDefinition,
  ExecutionContext,
} from "../../interfaces/node";

export abstract class BaseNode implements INode {
  type: NodeType;

  constructor(type: NodeType) {
    this.type = type;
  }

  abstract execute(
    nodeId: string,
    definition: NodeDefinition,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<any>;

  protected validateInputs(
    nodeId: string,
    definition: NodeDefinition,
    inputs: Record<string, any>
  ): void {
    if (!definition.inputs) return;

    for (const [inputName, inputDef] of Object.entries(definition.inputs)) {
      if (inputDef.required && inputs[inputName] === undefined) {
        throw new Error(
          `missing required input '${inputName}' for node ${nodeId}`
        );
      }
    }
  }

  protected async resolveInputs(
    definition: NodeDefinition,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    const resolvedInputs: Record<string, any> = {};

    if (!definition.inputs) return resolvedInputs;

    for (const [inputName, inputDef] of Object.entries(definition.inputs)) {
      if (inputDef.source) {
        const [sourceNodeId, sourceOutputField] = inputDef.source.split(".");

        if (sourceOutputField) {
          resolvedInputs[inputName] =
            context.outputs[sourceNodeId]?.[sourceOutputField];
        } else {
          resolvedInputs[inputName] = context.outputs[sourceNodeId];
        }
      } else if (context.inputs[inputName] !== undefined) {
        resolvedInputs[inputName] = context.inputs[inputName];
      }
    }

    return resolvedInputs;
  }
}
