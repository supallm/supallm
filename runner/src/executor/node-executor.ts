import { NodeDefinition, NodeExecutionResult } from "../models/workflow";
import { ProviderFactory } from "../providers/provider-factory";
import { logger } from "../utils/logger";

export class NodeExecutor {
  private providerFactory: ProviderFactory;

  constructor() {
    this.providerFactory = new ProviderFactory();
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
    // Get the LLM provider
    const provider = this.providerFactory.createLLMProvider({
      provider: node.auth?.provider,
      apiKey: node.auth?.apiKey,
      model: node.model,
    });

    // Get the prompt
    let prompt = node.prompt;

    // If there's an input prompt, use it instead
    if (inputs.prompt) {
      prompt = inputs.prompt;
    }

    // Replace variables in the prompt
    if (inputs.variables && typeof prompt === "string") {
      prompt = this.replaceVariables(prompt, inputs.variables);
    }

    // Execute the LLM call
    const result = await provider.generate(prompt, {
      temperature: node.parameters?.temperature || 0.7,
      maxTokens: node.parameters?.maxTokens || 1000,
    });

    return result;
  }

  private async executePromptNode(
    node: NodeDefinition,
    inputs: Record<string, any>
  ): Promise<any> {
    let template = node.template;

    // Replace variables in the template
    const variables = { ...node.variables, ...inputs };
    const prompt = this.replaceVariables(template, variables);

    return { prompt, variables };
  }

  private async executeRetrieverNode(
    node: NodeDefinition,
    inputs: Record<string, any>
  ): Promise<any> {
    // Implementation depends on the specific retriever type
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

    // Placeholder
    return { documents: [] };
  }

  private async executeToolNode(
    node: NodeDefinition,
    inputs: Record<string, any>
  ): Promise<any> {
    // Implementation depends on the specific tool
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

    // Placeholder
    return { result: null };
  }

  private async executeOutputNode(
    node: NodeDefinition,
    inputs: Record<string, any>
  ): Promise<any> {
    // Format the output according to the specified format
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
