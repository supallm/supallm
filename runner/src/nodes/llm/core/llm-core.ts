import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { Result } from "typescript-result";
import { CryptoService } from "../../../services/secret/crypto-service";
import { ToolContext } from "../../../tools";
import {
  NodeDefinition,
  NodeInput,
  NodeOutput,
  NodeOutputDef,
} from "../../types";
import {
  InvalidInputError,
  InvalidOutputError,
  LLMExecutionError,
  MissingAPIKeyError,
} from "../llm.errors";

export interface LLMNodeInputs {
  prompt: string;
  images?: string[];
}

export interface LLMRequestConfig {
  model: string;
  apiKey: string;
  decryptedApiKey: string;
  temperature: number;
  maxTokens?: number;
  streaming: boolean;
  systemPrompt?: string;
}

export interface ValidationResult {
  resolvedInputs: LLMNodeInputs;
  resolvedOutputs: NodeOutputDef;
  config: LLMRequestConfig;
}

export class LLMCore {
  constructor(private cryptoService: CryptoService) {}

  async validateAndPrepare(
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

  async prepareMessages(
    nodeId: string,
    toolContext: ToolContext,
    systemPrompt: string | undefined,
    inputs: LLMNodeInputs,
    sessionId: string,
  ): Promise<Result<BaseMessage[], LLMExecutionError>> {
    const memoryResult = await toolContext.run<BaseMessage[]>(
      "memory",
      "load",
      {
        sessionId,
        nodeId,
      },
    );
    const [loadResult, _loadError] = memoryResult.toTuple();

    return this.createMessagesFromInputs(
      systemPrompt,
      inputs,
      loadResult ?? [],
    );
  }

  async appendToMemory(
    toolContext: ToolContext,
    nodeId: string,
    sessionId: string,
    prompt: string,
    response: string,
  ): Promise<void> {
    await toolContext.run("memory", "append", {
      nodeId,
      sessionId,
      messages: [new HumanMessage(prompt), new AIMessage(response)],
    });
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
}
