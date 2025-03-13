import {
  NodeType,
  BaseNodeDefinition,
  ExecutionContext,
} from "../../interfaces/node";

export interface INode {
  type: NodeType;
  execute(
    nodeId: string,
    definition: BaseNodeDefinition,
    inputs: Record<string, any>,
    context: ExecutionContext,
    callbacks: {
      onNodeStream: (
        nodeId: string,
        outputField: string,
        chunk: string,
        type: "string" | "image"
      ) => Promise<void>;
    }
  ): Promise<any>;
}

export abstract class BaseNode implements INode {
  type: NodeType;

  constructor(type: NodeType) {
    this.type = type;
  }

  abstract execute(
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
  ): Promise<any>;

  protected validateInputs(
    nodeId: string,
    definition: BaseNodeDefinition,
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
    definition: BaseNodeDefinition,
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
