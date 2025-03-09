import {
  NodeDefinition,
  NodeExecutionResult,
  NodeType,
} from "../models/workflow";
import { ProviderFactory } from "../providers/provider-factory";
import { logger } from "../utils/logger";

export class NodeExecutor {
  private providerFactory: ProviderFactory;
  private maxTokens: number;
  private temperature: number;

  constructor() {
    this.providerFactory = new ProviderFactory();
    this.maxTokens = 5000;
    this.temperature = 0.7;
  }

  async executeNode(
    node: NodeDefinition,
    inputs: Record<string, any>
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    logger.info(`Executing node ${node.id} of type ${node.type}`);

    try {
      let output: any;

      switch (node.type) {
        case NodeType.LLM:
          output = await this.executeLLMNode(node, inputs);
          break;
        default:
          throw new Error(`Unsupported node type: ${node.type}`);
      }

      return {
        nodeId: node.id,
        success: true,
        output,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      logger.error(`Error executing node ${node.id}: ${error}`);
      return {
        nodeId: node.id,
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
      };
    }
  }

  private async executeLLMNode(
    node: NodeDefinition,
    inputs: Record<string, any>
  ): Promise<any> {
    const auth = node.auth || {};

    const provider = this.providerFactory.createLLMProvider({
      provider: auth.provider,
      apiKey: auth.apiKey,
      model: node.model,
    });

    let prompt = node.prompt;
    if (inputs.prompt) {
      prompt = inputs.prompt;
    }

    if (inputs.variables && typeof prompt === "string") {
      prompt = this.replaceVariables(prompt, inputs.variables);
    }

    const result = await provider.generate(prompt, {
      temperature: node.parameters?.temperature || this.temperature,
      maxTokens: node.parameters?.maxTokens || this.maxTokens,
    });

    return result;
  }

  private replaceVariables(
    template: string,
    variables: Record<string, any>
  ): string {
    return template.replace(/\{\{(.*?)\}\}/g, (match, variable) => {
      const trimmedVar = variable.trim();
      return variables[trimmedVar] !== undefined
        ? String(variables[trimmedVar])
        : match;
    });
  }
}
