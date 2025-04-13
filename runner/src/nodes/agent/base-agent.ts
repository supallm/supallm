import { ChatAnthropic } from "@langchain/anthropic";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import { Result } from "typescript-result";
import { z } from "zod";
import { CryptoService } from "../../services/secret/crypto-service";
import { ToolConfig } from "../../tools";
import { ToolRegistry } from "../../tools/tool-registry";
import {
  INode,
  NodeDefinition,
  NodeInput,
  NodeOptions,
  NodeOutput,
  NodeType,
} from "../types";

export abstract class BaseAgent implements INode {
  type: NodeType = "ai-agent";
  protected cryptoService: CryptoService;

  constructor() {
    this.cryptoService = new CryptoService();
  }

  abstract execute(
    nodeId: string,
    definition: NodeDefinition,
    inputs: NodeInput,
    options: NodeOptions,
  ): Promise<Result<NodeOutput, Error>>;

  protected convertToolsToLangChainFormat(
    tools: ToolConfig[],
    options: NodeOptions,
  ): DynamicStructuredTool<any>[] {
    return tools.map((toolConfig) => {
      const [tool, toolError] = ToolRegistry.create(toolConfig).toTuple();
      if (toolError) {
        throw toolError;
      }

      return new DynamicStructuredTool({
        name: `${tool.name}`,
        description: tool.description,
        schema: tool.schema,
        func: async (params: z.infer<typeof tool.schema>) => {
          const [result, resultError] = (
            await tool.run(params, options)
          ).toTuple();
          if (resultError) {
            throw resultError;
          }
          return result;
        },
      });
    });
  }

  protected createLLM(
    definition: NodeDefinition,
  ): Result<ChatOpenAI | ChatAnthropic, Error> {
    const [apiKey, decryptedApiKeyError] = this.cryptoService
      .decrypt(definition.config["apiKey"])
      .toTuple();
    if (decryptedApiKeyError) {
      return Result.error(decryptedApiKeyError);
    }

    let model = definition.config["model"];
    if (!model) {
      return Result.error(new Error("No model provided"));
    }

    switch (definition.config["provider"]) {
      case "openai":
        return Result.ok(
          new ChatOpenAI({
            modelName: model,
            temperature: 0,
            openAIApiKey: apiKey,
          }),
        );
      case "anthropic":
        return Result.ok(
          new ChatAnthropic({
            modelName: model,
            temperature: 0,
            anthropicApiKey: apiKey,
          }),
        );
      default:
        return Result.error(new Error("Invalid agent LLM provider"));
    }
  }
}
