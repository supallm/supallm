import { Result } from "typescript-result";
import { Agent } from "../../nodes/agent/agent";
import { EntrypointNode } from "../../nodes/base/entrypoint-node";
import { ResultNode } from "../../nodes/base/result-node";
import { CodeExecutorNode } from "../../nodes/code-executors/code-executor-node";
import { AnthropicProvider } from "../../nodes/llm/anthropic-provider";
import { DeepSeekProvider } from "../../nodes/llm/deepseek-provider";
import { GeminiProvider } from "../../nodes/llm/gemini-provider";
import { GrokProvider } from "../../nodes/llm/grok-provider";
import { MistralProvider } from "../../nodes/llm/mistral-provider";
import { OllamaProvider } from "../../nodes/llm/ollama-provider";
import { OpenAIProvider } from "../../nodes/llm/openai-provider";
import {
  INode,
  NodeDefinition,
  NodeInput,
  NodeOptions,
  NodeOutput,
  NodeType,
} from "../../nodes/types";
import { logger } from "../../utils/logger";
import { LLMMemoryService } from "../llm-memory/llm-memory.interface";
export class NodeManager {
  private nodes: Map<NodeType, INode> = new Map();

  constructor(_memoryService: LLMMemoryService) {
    // TODO: not proud of this, but it's a quick way to get the nodes working
    this.registerNode(new AnthropicProvider());
    this.registerNode(new OpenAIProvider());
    this.registerNode(new GeminiProvider());
    this.registerNode(new MistralProvider());
    this.registerNode(new GrokProvider());
    this.registerNode(new DeepSeekProvider());
    this.registerNode(new OllamaProvider());
    this.registerNode(new EntrypointNode());
    this.registerNode(new ResultNode());
    this.registerNode(new CodeExecutorNode());
    this.registerNode(new Agent());
  }

  private registerNode(node: INode): void {
    logger.info(`registering node: ${node.type}`);
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
    options: NodeOptions,
  ): Promise<Result<NodeOutput, Error>> {
    const nodeType = definition.type;
    const nodeImplementation = this.getNode(nodeType);

    if (!nodeImplementation) {
      return Result.error(new Error(`unsupported node type: ${nodeType}`));
    }

    return nodeImplementation.execute(nodeId, definition, inputs, options);
  }
}
