import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { Result } from "typescript-result";
import { CryptoService } from "../../services/secret/crypto-service";
import { Tool, ToolContext } from "../../tools";
import {
  INode,
  NodeDefinition,
  NodeInput,
  NodeOptions,
  NodeOutput,
  NodeOutputDef,
  NodeResultCallback,
  NodeType,
} from "../types";
import { AnthropicProvider } from "./anthropic-provider";
import { BaseLLMProvider, LLMOptions } from "./base-provider";
import {
  InvalidInputError,
  InvalidOutputError,
  LLMExecutionError,
  MissingAPIKeyError,
  ProviderAPIError,
  ProviderNotSupportedError,
} from "./llm.errors";
import { OpenAIProvider } from "./openai-provider";
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
    tools: Record<string, Tool>,
    options: NodeOptions,
  ): Promise<Result<NodeOutput, LLMExecutionError>> {
    const toolContext = new ToolContext(this.type, tools);

    const [resolvedInputs, validationError] =
      this.validateInputs(inputs).toTuple();

    if (validationError) {
      return Result.error(validationError);
    }

    const [resolvedOutputs, outputValidationError] = this.validateOutputs(
      definition.outputs,
    ).toTuple();

    if (outputValidationError) {
      return Result.error(outputValidationError);
    }

    const {
      model,
      provider = ProviderType.OPENAI,
      apiKey,
      temperature,
      maxTokens,
      streaming = false,
      systemPrompt,
    } = definition;

    if (!model) {
      return Result.error(
        new MissingAPIKeyError("model parameter is required"),
      );
    }

    if (!apiKey) {
      return Result.error(new MissingAPIKeyError("API key is required"));
    }

    const [providerInstance, providerError] =
      this.getProvider(provider).toTuple();

    if (providerError) {
      return Result.error(providerError);
    }

    const [decryptedApiKey, decryptedApiKeyError] = this.cryptoService
      .decrypt(apiKey)
      .toTuple();

    if (decryptedApiKeyError) {
      return Result.error(decryptedApiKeyError);
    }

    const loadResult = await toolContext.run<BaseMessage[]>("memory", "load", {
      sessionId: options.sessionId,
      nodeId,
    });

    const messages = this.createMessagesFromInputs(
      systemPrompt,
      resolvedInputs,
      !loadResult.isError() && loadResult.isOk() ? loadResult.value : [],
    );

    const res = await this.executeLLM(
      nodeId,
      providerInstance!,
      messages,
      {
        model,
        apiKey: decryptedApiKey,
        temperature: parseFloat(temperature.toString()),
        maxTokens: maxTokens ? parseInt(maxTokens.toString()) : undefined,
        streaming: streaming,
      },
      options.onNodeResult,
      resolvedOutputs,
    );

    const [result, error] = res.toTuple();
    if (error) {
      return Result.error(error);
    }

    await toolContext.run("memory", "append", {
      nodeId,
      sessionId: options.sessionId,
      messages: [
        new HumanMessage(resolvedInputs.prompt),
        new AIMessage(result["response"]),
      ],
    });
    return res;
  }

  private async executeLLM(
    nodeId: string,
    provider: BaseLLMProvider,
    messages: BaseMessage[],
    options: LLMOptions,
    onNodeResult: NodeResultCallback,
    output: NodeOutputDef,
  ): Promise<Result<NodeOutput, LLMExecutionError>> {
    let fullResponse = "";
    const [generateResult, generateError] = (
      await provider.generate(messages, options)
    ).toTuple();

    if (generateError) {
      return Result.error(generateError);
    }

    try {
      const outputField = output.result_key;
      const response = generateResult;

      for await (const data of response) {
        const chunkContent =
          typeof data.content === "string"
            ? data.content
            : JSON.stringify(data.content);

        if (chunkContent) {
          if (outputField) {
            await onNodeResult(nodeId, outputField, chunkContent, output.type);
          }
          fullResponse += chunkContent;
        }
      }

      return Result.ok({
        response: fullResponse,
      });
    } catch (error) {
      return Result.error(
        new ProviderAPIError(
          `failed to execute LLM: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  }

  private validateInputs(
    inputs: NodeInput,
  ): Result<LLMNodeInputs, LLMExecutionError> {
    if (!inputs || typeof inputs !== "object") {
      return Result.error(
        new InvalidInputError("invalid input: inputs must be an object"),
      );
    }

    if (typeof inputs["prompt"] !== "string") {
      return Result.error(
        new InvalidInputError("invalid input: missing or invalid prompt"),
      );
    }

    if (inputs["images"] !== undefined && !Array.isArray(inputs["images"])) {
      return Result.error(
        new InvalidInputError("invalid input: images must be an array"),
      );
    }

    if (Array.isArray(inputs["images"])) {
      const hasInvalidImage = inputs["images"].some(
        (img) => typeof img !== "string",
      );
      if (hasInvalidImage) {
        return Result.error(
          new InvalidInputError("invalid input: all images must be strings"),
        );
      }
    }

    return Result.ok({
      prompt: inputs["prompt"] as string,
      images: Array.isArray(inputs["images"])
        ? (inputs["images"] as string[])
        : undefined,
    });
  }

  private validateOutputs(
    outputs: NodeOutput,
  ): Result<NodeOutputDef, InvalidOutputError> {
    if (!outputs || typeof outputs !== "object") {
      return Result.error(
        new InvalidOutputError("invalid output: outputs must be an object"),
      );
    }

    if (!outputs["response"]) {
      return Result.error(
        new InvalidOutputError("invalid output: missing response"),
      );
    }

    const output = outputs["response"] as NodeOutputDef;
    return Result.ok(output);
  }

  private createMessagesFromInputs(
    systemPrompt: string | undefined,
    inputs: LLMNodeInputs,
    memoryMessages: BaseMessage[],
  ): BaseMessage[] {
    const messages: BaseMessage[] = [];

    if (systemPrompt) {
      messages.push(new SystemMessage(systemPrompt));
    }

    if (memoryMessages.length > 0) {
      messages.push(...memoryMessages);
    }

    messages.push(new HumanMessage(inputs.prompt));

    return messages;
  }

  private getProvider(
    providerType: SupportedProviders,
  ): Result<BaseLLMProvider, ProviderNotSupportedError> {
    const provider = this.providers.get(providerType);

    if (!provider) {
      return Result.error(
        new ProviderNotSupportedError(
          `unsupported LLM provider: ${providerType}`,
        ),
      );
    }

    return Result.ok(provider);
  }
}
