import {
  NodeType,
  NodeDefinition,
  NodeResultCallback,
  NodeInput,
} from "../../nodes/types";
import { INode } from "../../nodes/types";
import { EntrypointNode } from "../../nodes/base/entrypoint-node";
import { ResultNode } from "../../nodes/base/result-node";
import { LLMNode } from "../../nodes/llm/llm-node";
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
    inputs: NodeInput,
    callbacks: {
      onNodeResult: NodeResultCallback;
    }
  ): Promise<any> {
    const nodeType = definition.type;
    const nodeImplementation = this.getNode(nodeType);

    if (!nodeImplementation) {
      throw new Error(`unsupported node type: ${nodeType}`);
    }

    return await nodeImplementation.execute(nodeId, definition, inputs, {
      onNodeResult: callbacks.onNodeResult,
    });
  }
}
