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
    inputs: Record<string, any>,
    credentials?: Record<string, any>
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    logger.info(`Executing node ${node.id} of type ${node.type}`);

    try {
      let output: any;

      switch (node.type) {
        case NodeType.LLM:
          output = await this.executeLLMNode(node, inputs, credentials);
          break;
        case NodeType.TRANSFORM:
          output = await this.executeTransformNode(node, inputs);
          break;
        case NodeType.MERGE:
          output = this.executeMergeNode(inputs);
          break;
        case NodeType.ENTRYPOINT:
          output = inputs;
          break;
        case NodeType.RESULT:
          output = inputs;
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
    inputs: Record<string, any>,
    credentials?: Record<string, any>
  ): Promise<any> {
    const auth = this.resolveAuth(node, credentials);
    const useRealStreaming = node.streaming === true;

    const provider = this.providerFactory.createLLMProvider({
      provider: node.provider || auth.provider,
      apiKey: auth.apiKey,
      model: node.model || "",
    });

    // Build the prompt
    let prompt = node.userPrompt || "";

    // Replace variables in the prompt
    if (prompt) {
      prompt = this.replaceVariables(prompt, inputs);
    } else if (Object.keys(inputs).length === 1) {
      // If no prompt defined but one input, use it as prompt
      const inputKey = Object.keys(inputs)[0];
      prompt = inputs[inputKey];
    }

    logger.info(
      `Executing LLM node ${node.id} with ${
        useRealStreaming ? "real" : "simulated"
      } streaming`
    );

    const startTime = Date.now();
    let fullText = "";

    if (useRealStreaming) {
      const stream = await provider.stream(prompt, {
        systemPrompt: node.systemPrompt,
        temperature: node.parameters?.temperature || 0.7,
        maxTokens: node.parameters?.maxTokens || 2000,
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
        systemPrompt: node.systemPrompt,
        temperature: node.parameters?.temperature || 0.7,
        maxTokens: node.parameters?.maxTokens || 2000,
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

    logger.info(
      `LLM node ${node.id} execution completed in ${
        Date.now() - startTime
      }ms, generated ${fullText.length} chars`
    );

    // Determine the output format
    const responseFormat = node.parameters?.responseFormat || "text";

    if (responseFormat === "json") {
      try {
        return { text: fullText, json: JSON.parse(fullText) };
      } catch (e) {
        logger.warn(`Failed to parse JSON response: ${e}`);
        return { text: fullText };
      }
    }

    return { text: fullText };
  }

  private async executeTransformNode(
    node: NodeDefinition,
    inputs: Record<string, any>
  ): Promise<any> {
    const code = node.code;

    if (!code) {
      throw new Error("Transform node requires code property");
    }

    try {
      // Create a function from the code
      const transformFn = new Function("inputs", code);
      return transformFn(inputs);
    } catch (error) {
      throw new Error(`Error executing transform: ${error}`);
    }
  }

  private executeMergeNode(inputs: Record<string, any>): any {
    // The merge node simply combines all inputs into an object
    return inputs;
  }

  private replaceVariables(
    template: string,
    variables: Record<string, any>
  ): string {
    return template.replace(/\{\{(.*?)\}\}/g, (match, variable) => {
      const path = variable.trim().split(".");

      if (path[0] === "inputs") {
        path.shift(); // Remove 'inputs'

        let value = variables;
        for (const prop of path) {
          if (value === undefined || value === null) break;
          value = value[prop];
        }

        if (value === undefined) return match;

        if (typeof value === "object") {
          return JSON.stringify(value);
        }

        return String(value);
      }

      if (path[0] === "JSON") {
        if (path[1] === "stringify" && path.length > 2) {
          const objPath = path.slice(2);
          let value = variables;

          for (const prop of objPath) {
            if (value === undefined || value === null) break;
            value = value[prop];
          }

          if (value === undefined) return match;

          return JSON.stringify(value);
        }
      }

      return match;
    });
  }

  private resolveAuth(
    node: NodeDefinition,
    credentials?: Record<string, any>
  ): Record<string, any> {
    // If no auth defined, return an empty object
    if (!node.auth) {
      return {};
    }

    // If credentials are provided and there is a reference to a provider
    if (credentials && node.auth.provider) {
      const providerKey = node.auth.provider;
      return {
        provider: providerKey,
        apiKey: credentials[providerKey] || node.auth.apiKey,
      };
    }

    // Otherwise, use the auth defined in the node
    return node.auth;
  }
}
