import { BaseNode } from "../base/base-node";
import {
  NodeDefinition,
  ExecutionContext,
  NodeResultCallback,
  NodeIOType,
} from "../../interfaces/node";
import { logger } from "../../utils/logger";
import { CryptoService } from "../../services/crypto-service";
import { BaseLLMProvider, LLMOptions } from "./base-provider";
import { OpenAIProvider } from "./openai-provider";
import { AnthropicProvider } from "./anthropic-provider";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const ProviderType = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
} as const;

type SupportedProviders = (typeof ProviderType)[keyof typeof ProviderType];

interface LLMNodeInputs {
  prompt: string;
  images?: string[];
}

export class LLMNode extends BaseNode {
  private providers: Map<SupportedProviders, BaseLLMProvider>;
  private cryptoService: CryptoService;

  constructor() {
    super("llm");
    this.cryptoService = new CryptoService();
    this.providers = new Map<SupportedProviders, BaseLLMProvider>([
      [ProviderType.OPENAI, new OpenAIProvider()],
      [ProviderType.ANTHROPIC, new AnthropicProvider()],
    ]);
  }

  async execute(
    nodeId: string,
    definition: NodeDefinition,
    context: ExecutionContext,
    options: {
      onNodeResult: NodeResultCallback;
    }
  ): Promise<any> {
    try {
      const resolvedInputs = this.resolveInputs(
        nodeId,
        definition,
        context
      ) as LLMNodeInputs;
      this.validateInputs(nodeId, definition, resolvedInputs);

      const {
        model,
        provider = ProviderType.OPENAI,
        apiKey,
        temperature = 0.5,
        maxTokens,
        streaming = false,
        systemPrompt,
      } = definition;

      if (!model) {
        throw new Error(`model is required for LLM node ${nodeId}`);
      }

      const llmProvider = this.getProvider(provider as SupportedProviders);
      const decryptedApiKey = this.cryptoService.decrypt(apiKey);
      const messages = this.createMessagesFromInputs(
        systemPrompt,
        resolvedInputs
      );
      const llmOptions: LLMOptions = {
        model,
        apiKey: decryptedApiKey,
        temperature: parseFloat(temperature.toString()),
        maxTokens: maxTokens ? parseInt(maxTokens.toString()) : undefined,
        streaming: streaming,
      };

      // define the output field (default: "response")
      // define the output field type (default: "text")
      const outputField =
        Object.keys(definition.outputs || {})[0] || "response";
      const outputFieldType = definition.outputs?.[outputField]?.type || "text";

      return this.executeLLM(
        nodeId,
        llmProvider,
        messages,
        llmOptions,
        options.onNodeResult,
        outputField,
        outputFieldType as NodeIOType
      );
    } catch (error) {
      logger.error(`Error executing LLM node ${nodeId}: ${error}`);
      throw error;
    }
  }

  private createMessagesFromInputs(
    systemPrompt: string | undefined,
    inputs: LLMNodeInputs
  ): (SystemMessage | HumanMessage)[] {
    const messages: (SystemMessage | HumanMessage)[] = [];

    if (systemPrompt) {
      messages.push(new SystemMessage(systemPrompt));
    }

    let promptText = inputs.prompt;
    messages.push(new HumanMessage(promptText));

    return messages;
  }

  private getProvider(providerType: SupportedProviders): BaseLLMProvider {
    const provider = this.providers.get(providerType);

    if (!provider) {
      throw new Error(`Unsupported LLM provider: ${providerType}`);
    }

    return provider;
  }

  private async executeLLM(
    nodeId: string,
    provider: BaseLLMProvider,
    messages: (SystemMessage | HumanMessage)[],
    options: LLMOptions,
    onNodeResult: NodeResultCallback,
    outputField: string = "response",
    outputType: NodeIOType = "text"
  ): Promise<any> {
    let fullResponse = "";

    try {
      const response = await provider.generate(messages, options);

      for await (const data of response) {
        const chunkContent =
          typeof data.content === "string"
            ? data.content
            : JSON.stringify(data.content);

        if (chunkContent) {
          await onNodeResult(nodeId, outputField, chunkContent, outputType);
          fullResponse += chunkContent;
        }
      }

      return {
        [outputField]: fullResponse,
      };
    } catch (error) {
      logger.error(`error in LLM execution for node ${nodeId}: ${error}`);
      throw error;
    }
  }
}
