import { Result } from "typescript-result";
import { EntrypointNode } from "../../nodes/base/entrypoint-node";
import { ResultNode } from "../../nodes/base/result-node";
import { CodeExecutorNode } from "../../nodes/code-executors/code-executor-node";
import { AnthropicProvider } from "../../nodes/llm/anthropic-provider";
import { OpenAIProvider } from "../../nodes/llm/openai-provider";
import {
  INode,
  NodeDefinition,
  NodeInput,
  NodeOptions,
  NodeOutput,
  NodeType,
} from "../../nodes/types";
import { Tool } from "../../tools";
import { LLMMemoryService } from "../llm-memory/llm-memory.interface";

export class NodeManager {
  private nodes: Map<NodeType, INode> = new Map();

  constructor(_memoryService: LLMMemoryService) {
    this.registerNode(new AnthropicProvider());
    this.registerNode(new OpenAIProvider());
    this.registerNode(new EntrypointNode());
    this.registerNode(new ResultNode());
    this.registerNode(new CodeExecutorNode());
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
    tools: Record<string, Tool>,
    options: NodeOptions,
  ): Promise<Result<NodeOutput, Error>> {
    const nodeType = definition.type;
    const nodeImplementation = this.getNode(nodeType);

    if (!nodeImplementation) {
      return Result.error(new Error(`unsupported node type: ${nodeType}`));
    }

    return nodeImplementation.execute(
      nodeId,
      definition,
      inputs,
      tools,
      options,
    );
  }
}
