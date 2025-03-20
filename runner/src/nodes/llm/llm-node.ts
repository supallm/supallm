import {
  INode,
  NodeDefinition,
  NodeResultCallback,
  NodeOutputDef,
  NodeInput,
  NodeOutput,
  NodeType,
  NodeLogCallback,
} from "../types";
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

export class LLMNode implements INode {
  type: NodeType;
  private providers: Map<SupportedProviders, BaseLLMProvider>;
  private cryptoService: CryptoService;

  constructor() {
    this.type = "llm";
    this.cryptoService = new CryptoService();
    this.providers = new Map<SupportedProviders, BaseLLMProvider>([
      [ProviderType.OPENAI, new OpenAIProvider()],
      [ProviderType.ANTHROPIC, new AnthropicProvider()],
    ]);
  }

  async execute(
    nodeId: string,
    definition: NodeDefinition,
    inputs: NodeInput,
    options: {
      onNodeResult: NodeResultCallback;
      onNodeLog: NodeLogCallback;
    }
  ): Promise<NodeOutput> {
    try {
      const resolvedInputs = inputs as LLMNodeInputs;
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

      const output = definition.outputs?.response;

      return this.executeLLM(
        nodeId,
        llmProvider,
        messages,
        llmOptions,
        options.onNodeResult,
        output
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
    output: NodeOutputDef
  ): Promise<NodeOutput> {
    let fullResponse = "";
    const outputField = output.result_key || "response";

    try {
      const response = await provider.generate(messages, options);

      for await (const data of response) {
        const chunkContent =
          typeof data.content === "string"
            ? data.content
            : JSON.stringify(data.content);

        if (chunkContent) {
          await onNodeResult(nodeId, outputField, chunkContent, output.type);
          fullResponse += chunkContent;
        }
      }

      return {
        response: fullResponse,
      };
    } catch (error) {
      logger.error(`error in LLM execution for node ${nodeId}: ${error}`);
      throw error;
    }
  }
}
