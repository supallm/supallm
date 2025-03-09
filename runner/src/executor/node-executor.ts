import {
  NodeDefinition,
  NodeExecutionResult,
  NodeType,
} from "../models/workflow";
import { ProviderFactory } from "../providers/provider-factory";
import { logger } from "../utils/logger";
import { EventEmitter } from "events";

export class NodeExecutor extends EventEmitter {
  private providerFactory: ProviderFactory;
  private maxTokens: number;
  private temperature: number;

  constructor() {
    super();
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
    const useRealStreaming = node.streaming === true;

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

    logger.info(
      `Executing node ${node.id} with ${
        useRealStreaming ? "real" : "simulated"
      } streaming`
    );

    const startTime = Date.now();
    let fullText = "";

    if (useRealStreaming) {
      const stream = await provider.stream(prompt, {
        temperature: node.parameters?.temperature || this.temperature,
        maxTokens: node.parameters?.maxTokens || this.maxTokens,
      });

      for await (const chunk of stream) {
        let content = "";
        if (chunk.content) {
          content = chunk.content;
        } else if (chunk.text) {
          content = chunk.text;
        } else if (typeof chunk === "string") {
          content = chunk;
        } else if (chunk.choices && chunk.choices[0]?.delta?.content) {
          content = chunk.choices[0].delta.content;
        }

        if (!content) continue;

        fullText += content;

        logger.debug(
          `Streaming chunk for node ${node.id}: ${content.length} chars`
        );

        this.emit("nodeStreaming", {
          nodeId: node.id,
          chunk: content,
        });
      }
    } else {
      const result = await provider.generate(prompt, {
        temperature: node.parameters?.temperature || this.temperature,
        maxTokens: node.parameters?.maxTokens || this.maxTokens,
      });

      fullText = result.text || "";

      this.emit("nodeStreaming", {
        nodeId: node.id,
        chunk: fullText,
      });
    }

    this.emit("nodeEndStreaming", {
      nodeId: node.id,
      fullText: fullText,
    });

    const duration = Date.now() - startTime;
    logger.info(
      `Node ${node.id} execution completed in ${duration}ms, text length: ${fullText.length}`
    );

    return { text: fullText };
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
