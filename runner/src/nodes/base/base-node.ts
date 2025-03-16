import {
  NodeType,
  NodeDefinition,
  ExecutionContext,
  INode,
  NodeResultCallback,
} from "../../interfaces/node";

export abstract class BaseNode implements INode {
  type: NodeType;

  constructor(type: NodeType) {
    this.type = type;
  }

  abstract execute(
    nodeId: string,
    definition: NodeDefinition,
    context: ExecutionContext,
    callbacks: {
      onNodeResult: NodeResultCallback;
    }
  ): Promise<Record<string, any>>;

  protected validateInputs(
    nodeId: string,
    definition: NodeDefinition,
    resolvedInputs: Record<string, any>
  ): void {
    if (!definition.inputs) return;

    for (const [inputName, inputDef] of Object.entries(definition.inputs)) {
      if (inputDef.required && resolvedInputs[inputName] === undefined) {
        throw new Error(
          `missing required input '${inputName}' for node ${nodeId}`
        );
      }
    }
  }

  protected resolveInputs(
    nodeId: string,
    definition: NodeDefinition,
    context: ExecutionContext
  ): Record<string, any> {
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
