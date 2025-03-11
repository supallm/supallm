import {
  INode,
  NodeType,
  NodeDefinition,
  ExecutionContext,
} from "../interfaces/node";
import { EntrypointNode } from "../nodes/base/entrypoint-node";
import { ResultNode } from "../nodes/base/result-node";
import { LLMNode } from "../nodes/llm/llm-node";

export class NodeManager {
  private nodes: Map<NodeType, INode> = new Map();

  constructor() {
    this.registerNode(new LLMNode());
    this.registerNode(new EntrypointNode());
    this.registerNode(new ResultNode());
  }

  private registerNode(node: INode): void {
    this.nodes.set(node.type, node);
  }

  private getNode(type: NodeType): INode {
    const node = this.nodes.get(type);
    if (!node) {
      throw new Error(`no node implementation found for type: ${type}`);
    }
    return node;
  }

  async executeNode(
    nodeId: string,
    definition: NodeDefinition,
    inputs: Record<string, any>,
    context: ExecutionContext,
    callbacks: {
      onNodeStream?: (
        nodeId: string,
        outputField: string,
        chunk: string
      ) => Promise<void>;
    }
  ): Promise<any> {
    const node = this.getNode(definition.type);
    return await node.execute(nodeId, definition, inputs, context, callbacks);
  }
}
