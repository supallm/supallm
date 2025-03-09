import { NodeDefinition, NodeExecutionResult } from "../models/workflow";
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
        case "llm":
          output = await this.executeLLMNode(node, inputs);
          break;
        case "prompt":
          output = await this.executePromptNode(node, inputs);
          break;
        case "retriever":
          output = await this.executeRetrieverNode(node, inputs);
          break;
        case "tool":
          output = await this.executeToolNode(node, inputs);
          break;
        case "output":
          output = await this.executeOutputNode(node, inputs);
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
      provider: auth.provider || "openai",
      apiKey: auth.apiKey || "sk-test",
      model: node.model || "gpt-4o-mini",
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

  private async executePromptNode(
    node: NodeDefinition,
    inputs: Record<string, any>
  ): Promise<any> {
    let template = node.template;

    const variables = { ...node.variables, ...inputs };
    const prompt = this.replaceVariables(template, variables);

    return { prompt, variables };
  }

  private async executeRetrieverNode(
    node: NodeDefinition,
    inputs: Record<string, any>
  ): Promise<any> {
    switch (node.source) {
      case "web":
        // Implement web retrieval
        break;
      case "pdf":
        // Implement PDF retrieval
        break;
      default:
        throw new Error(`Unsupported retriever source: ${node.source}`);
    }

    return { documents: [] };
  }

  private async executeToolNode(
    node: NodeDefinition,
    inputs: Record<string, any>
  ): Promise<any> {
    switch (node.toolName) {
      case "calculator":
        // Implement calculator
        break;
      case "webSearch":
        // Implement web search
        break;
      default:
        throw new Error(`Unsupported tool: ${node.toolName}`);
    }

    return { result: null };
  }

  private async executeOutputNode(
    node: NodeDefinition,
    inputs: Record<string, any>
  ): Promise<any> {
    switch (node.format) {
      case "json":
        try {
          return typeof inputs.input === "string"
            ? JSON.parse(inputs.input)
            : inputs.input;
        } catch (e) {
          return { text: inputs.input };
        }
      case "text":
        return { text: String(inputs.input) };
      default:
        return inputs.input;
    }
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
