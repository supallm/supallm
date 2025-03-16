import { BaseNode } from "../base/base-node";
import {
  NodeDefinition,
  ExecutionContext,
  NodeResultCallback,
  NodeIOType,
} from "../../interfaces/node";
import { logger } from "../../utils/logger";
import { CryptoService } from "../../services/crypto-service";
import { BaseLLMProvider } from "./base-provider";
import { OpenAIProvider } from "./openai-provider";
import { AnthropicProvider } from "./anthropic-provider";

const ProviderType = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
} as const;

const outputField = "response";

export class LLMNode extends BaseNode {
  constructor() {
    super("llm");
    this.cryptoService = new CryptoService();
  }

  private cryptoService: CryptoService;

  async execute(
    nodeId: string,
    definition: NodeDefinition,
    context: ExecutionContext,
    callbacks: {
      onNodeResult: NodeResultCallback;
    }
  ): Promise<Record<string, any>> {
    try {
      const resolvedInputs = this.resolveInputs(nodeId, definition, context);
      this.validateInputs(nodeId, definition, resolvedInputs);

      if (!definition.provider) {
        throw new Error(`provider is required for LLM node ${nodeId}`);
      }

      if (!definition.apiKey) {
        throw new Error(`API key is required for LLM node ${nodeId}`);
      }

      const provider = this.selectProvider(definition.provider);

      // for now, we only support one output field named "response" 
      // of type text (json, text, markdown, image, etc) are still text
      const notify = definition.outputs[outputField]?.notify || false;
      const outputFieldType = definition.outputs[outputField]?.type || "text";

      const llmOptions = {
        model: definition.model || "",
        apiKey: this.cryptoService.decrypt(definition.apiKey),
        temperature: definition.temperature || 0.5,
        maxTokens: definition.maxTokens || 1000,
        systemPrompt: definition.systemPrompt || "",
        streaming: definition.streaming === true,
        nodeId,
      };

      const prompt = resolvedInputs.prompt;
      const result = await provider.generate(prompt, llmOptions);
      let response = "";

      for await (const data of result) {
        if (data.content) {
          response += data.content;
          if (notify) {
            await callbacks.onNodeResult(
              nodeId,
              outputField,
              data.content,
              outputFieldType
            );
          }
        }
      }

      return { [outputField]: response };
    } catch (error) {
      logger.error(`error executing LLM node ${nodeId}: ${error}`);
      throw error;
    }
  }

  private selectProvider(providerType: string): BaseLLMProvider {
    const type = providerType.toLowerCase();

    switch (type) {
      case ProviderType.OPENAI:
        return new OpenAIProvider();
      case ProviderType.ANTHROPIC:
        return new AnthropicProvider();
      default:
        throw new Error(`Unsupported LLM provider: ${type}`);
    }
  }
}
