import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { Result } from "typescript-result";
import { CryptoService } from "../../services/secret/crypto-service";
import { MemoryTool, Tool, ToolContext } from "../../tools";
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
import { BaseLLMProvider, GenerateResult, LLMOptions } from "./base-provider";
import {
  InvalidInputError,
  InvalidOutputError,
  LLMExecutionError,
  MessageFormatError,
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

interface LLMRequestConfig {
  model: string;
  provider: SupportedProviders;
  apiKey: string;
  decryptedApiKey: string;
  temperature: number;
  maxTokens?: number;
  streaming: boolean;
  systemPrompt?: string;
}

interface ValidationResult {
  resolvedInputs: LLMNodeInputs;
  resolvedOutputs: NodeOutputDef;
  config: LLMRequestConfig;
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
    _tools: Record<string, Tool>,
    options: NodeOptions,
  ): Promise<Result<NodeOutput, LLMExecutionError>> {
    const toolContext = new ToolContext(this.type, {
      memory: new MemoryTool("memory"),
    });

    const validateAndPrepare = await this.validateAndPrepare(
      definition,
      inputs,
    );
    const [validateAndPrepareResult, validateAndPrepareError] =
      validateAndPrepare.toTuple();
    if (validateAndPrepareError) {
      return Result.error(validateAndPrepareError);
    }

    const { resolvedInputs, resolvedOutputs, config } =
      validateAndPrepareResult;

    const [getProviderResult, getProviderError] = this.getProvider(
      config.provider,
    ).toTuple();
    if (getProviderError) {
      return Result.error(getProviderError);
    }

    const prepareMessages = await this.prepareMessages(
      nodeId,
      toolContext,
      config.systemPrompt,
      resolvedInputs,
      options.sessionId,
    );
    const [prepareMessagesResult, prepareMessagesError] =
      prepareMessages.toTuple();
    if (prepareMessagesError) {
      return Result.error(prepareMessagesError);
    }

    const executeLLM = await this.executeLLM(
      nodeId,
      getProviderResult,
      prepareMessagesResult,
      {
        model: config.model,
        apiKey: config.decryptedApiKey,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        streaming: config.streaming,
      },
      options.onNodeResult,
      resolvedOutputs,
    );
    const [executeLLMResult, executeLLMError] = executeLLM.toTuple();
    if (executeLLMError) {
      return Result.error(executeLLMError);
    }

    if (executeLLMResult["response"]) {
      await this.appendToMemory(
        toolContext,
        nodeId,
        options.sessionId,
        resolvedInputs.prompt,
        executeLLMResult["response"] as string,
      );
    }

    return Result.ok(executeLLMResult);
  }

  private async validateAndPrepare(
    definition: NodeDefinition,
    inputs: NodeInput,
  ): Promise<Result<ValidationResult, LLMExecutionError>> {
    const [resolvedInputs, inputError] = this.validateInputs(inputs).toTuple();
    if (inputError) {
      return Result.error(inputError);
    }

    const [resolvedOutputs, outputError] = this.validateOutputs(
      definition.outputs,
    ).toTuple();
    if (outputError) {
      return Result.error(outputError);
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

    const [decryptedApiKey, decryptedApiKeyError] = this.cryptoService
      .decrypt(apiKey)
      .toTuple();
    if (decryptedApiKeyError) {
      return Result.error(decryptedApiKeyError);
    }

    const config: LLMRequestConfig = {
      model,
      provider,
      apiKey,
      decryptedApiKey,
      temperature: parseFloat(temperature.toString()),
      maxTokens: maxTokens ? parseInt(maxTokens.toString()) : undefined,
      streaming,
      systemPrompt,
    };

    return Result.ok({
      resolvedInputs,
      resolvedOutputs,
      config,
    });
  }

  /**
   * Prepare messages for the LLM request including memory
   */
  private async prepareMessages(
    nodeId: string,
    toolContext: ToolContext,
    systemPrompt: string | undefined,
    inputs: LLMNodeInputs,
    _sessionId: string,
  ): Promise<Result<BaseMessage[], LLMExecutionError>> {
    const memoryResult = await toolContext.run<BaseMessage[]>(
      "memory",
      "load",
      {
        sessionId: "sessionId",
        nodeId,
      },
    );
    const [loadResult, loadError] = memoryResult.toTuple();
    if (loadError) {
      return Result.error(new MessageFormatError(`load memory history error`));
    }

    return this.createMessagesFromInputs(systemPrompt, inputs, loadResult);
  }

  /**
   * Save conversation to memory
   */
  private async appendToMemory(
    toolContext: ToolContext,
    nodeId: string,
    _sessionId: string,
    prompt: string,
    response: string,
  ): Promise<void> {
    await toolContext.run("memory", "append", {
      nodeId,
      sessionId: "sessionId",
      messages: [new HumanMessage(prompt), new AIMessage(response)],
    });
  }

  /**
   * Execute an LLM request and handle streaming
   */
  private async executeLLM(
    nodeId: string,
    provider: BaseLLMProvider,
    messages: BaseMessage[],
    options: LLMOptions,
    onNodeResult: NodeResultCallback,
    output: NodeOutputDef,
  ): Promise<Result<NodeOutput, LLMExecutionError>> {
    try {
      const generateResult = await provider.generate(messages, options);
      if (generateResult.isError()) {
        return Result.error(generateResult.error);
      }

      let fullResponse = "";
      const response = generateResult.value as GenerateResult;
      const outputField = output.result_key;

      for await (const data of response) {
        const chunkContent = this.formatChunkContent(data);

        if (chunkContent) {
          if (outputField) {
            await onNodeResult(nodeId, outputField, chunkContent, output.type);
          }
          fullResponse += chunkContent;
        }
      }

      return Result.ok({ response: fullResponse });
    } catch (error) {
      return Result.error(new ProviderAPIError(`failed to execute LLM`));
    }
  }

  private formatChunkContent(data: { content: string | object }): string {
    return typeof data.content === "string"
      ? data.content
      : JSON.stringify(data.content);
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
  ): Result<BaseMessage[], LLMExecutionError> {
    const messages: BaseMessage[] = [];

    if (systemPrompt) {
      messages.push(new SystemMessage(systemPrompt));
    }

    if (memoryMessages.length > 0) {
      messages.push(...memoryMessages);
    }

    messages.push(new HumanMessage(inputs.prompt));

    return Result.ok(messages);
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
