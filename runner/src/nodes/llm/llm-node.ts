import { BaseNode } from "../base/base-node";
import { LLMNodeDefinition, ExecutionContext } from "../../interfaces/node";
import { logger } from "../../utils/logger";
import { CryptoService } from "../../services/crypto-service";
import { BaseLLMProvider } from "./base-provider";
import { OpenAIProvider } from "./openai-provider";

const ProviderType = {
  OPENAI: "openai",
};

export class LLMNode extends BaseNode {
  private cryptoService: CryptoService;

  constructor() {
    super("llm");
    this.cryptoService = new CryptoService();
  }

  async execute(
    nodeId: string,
    definition: LLMNodeDefinition,
    inputs: Record<string, any>,
    context: ExecutionContext,
    callbacks: {
      onNodeStream: (
        nodeId: string,
        outputField: string,
        chunk: string,
        type: "string" | "image"
      ) => Promise<void>;
    }
  ): Promise<any> {
    try {
      const resolvedInputs = await this.resolveInputs(definition, context);
      this.validateInputs(nodeId, definition, resolvedInputs);

      if (!definition.provider) {
        throw new Error(`provider is required for LLM node ${nodeId}`);
      }

      if (!definition.apiKey) {
        throw new Error(`API key is required for LLM node ${nodeId}`);
      }

      const provider = this.selectProvider(definition);

      const options = {
        model: definition.model || "",
        apiKey: this.cryptoService.decrypt(definition.apiKey),
        temperature: definition.temperature || 0.5,
        maxTokens: definition.maxTokens || 1000,
        systemPrompt: definition.systemPrompt || "",
        streaming: definition.streaming === true,
        nodeId,
        callbacks,
      };

      const prompt = resolvedInputs.prompt;
      const streamOutputField =
        definition.outputs?.responseStream?.outputField || "responseStream";
      const responseOutputField =
        definition.outputs?.response?.outputField || "response";

      if (options.streaming) {
        const streamResult = await provider.stream(prompt, options);

        let fullResponse = "";
        for await (const chunk of streamResult) {
          const content = chunk.content || chunk.text || "";
          if (content) {
            fullResponse += content;
            await callbacks.onNodeStream(
              nodeId,
              streamOutputField,
              content,
              "string"
            );
          }
        }

        return { response: fullResponse };
      } else {
        const result = await provider.generate(prompt, options);
        await callbacks.onNodeStream(
          nodeId,
          responseOutputField,
          result.response,
          "string"
        );
        return result;
      }
    } catch (error) {
      logger.error(`error executing LLM node ${nodeId}: ${error}`);
      throw error;
    }
  }

  private selectProvider(definition: LLMNodeDefinition): BaseLLMProvider {
    const providerType = definition.provider.toLowerCase();

    switch (providerType) {
      case ProviderType.OPENAI:
        return new OpenAIProvider();

      default:
        throw new Error(`Unsupported LLM provider: ${providerType}`);
    }
  }
}
