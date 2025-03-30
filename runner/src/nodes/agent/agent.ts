import { ChatAnthropic } from "@langchain/anthropic";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
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

export class Agent implements INode {
  type: NodeType = "agent";
  private cryptoService: CryptoService;

  constructor() {
    this.cryptoService = new CryptoService();
  }

  async execute(
    nodeId: string,
    definition: NodeDefinition,
    inputs: NodeInput,
    options: NodeOptions,
  ): Promise<Result<NodeOutput, Error>> {
    try {
      const [llm, llmError] = this.createLLM(definition).toTuple();
      if (llmError) {
        return Result.error(llmError);
      }

      const langchainTools = this.convertToolsToLangChainFormat(
        definition.tools,
      );
      const toolNode = new ToolNode(langchainTools);
      const model = llm.bindTools(langchainTools);

      function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
        const lastMessage = messages[messages.length - 1] as AIMessage;
        if (lastMessage.tool_calls?.length) {
          return "tools";
        }
        return "__end__";
      }

      async function callModel(state: typeof MessagesAnnotation.State) {
        const response = await model.invoke(state.messages);
        return { messages: [response] };
      }

      const workflow = new StateGraph(MessagesAnnotation)
        .addNode("agent", callModel)
        .addNode("tools", toolNode)
        .addEdge("tools", "agent")
        .addEdge("__start__", "agent")
        .addConditionalEdges("agent", shouldContinue);

      const app = workflow.compile();
      const finalState = await app.invoke({
        messages: [
          new SystemMessage(
            definition["instructions"] || "You are a helpful AI assistant.",
          ),
          new HumanMessage(inputs["prompt"]),
        ],
      });

      const finalResponse = finalState.messages?.length
        ? (finalState.messages[finalState.messages.length - 1]?.content ??
          "No response generated")
        : "No response generated";

      options.onNodeResult(
        nodeId,
        "response",
        finalResponse.toString(),
        "text",
      );
      return Result.ok({ response: finalResponse });
    } catch (error) {
      return Result.error(new Error(`Agent execution failed: ${error}`));
    }
  }

  private convertToolsToLangChainFormat(
    tools: ToolConfig[],
  ): DynamicStructuredTool<any>[] {
    return tools.map((toolConfig) => {
      const [tool, toolError] = ToolRegistry.create(
        toolConfig.type,
        toolConfig,
      ).toTuple();
      if (toolError) {
        throw toolError;
      }

      return new DynamicStructuredTool({
        name: tool.name,
        description: tool.description,
        schema: tool.schema,
        func: async (params: z.infer<typeof tool.schema>) => {
          const [result, resultError] = (await tool.run(params)).toTuple();
          if (resultError) {
            throw resultError;
          }
          return result;
        },
      });
    });
  }

  private createLLM(
    definition: NodeDefinition,
  ): Result<ChatOpenAI | ChatAnthropic, Error> {
    let apiKey = definition["apiKey"];
    if (apiKey) {
      const [decryptedApiKeyResult, decryptedApiKeyError] = this.cryptoService
        .decrypt(apiKey)
        .toTuple();
      if (decryptedApiKeyError) {
        return Result.error(decryptedApiKeyError);
      }
      apiKey = decryptedApiKeyResult;
    }

    switch (definition["provider"]) {
      case "openai":
        return Result.ok(
          new ChatOpenAI({
            modelName: definition["model"],
            temperature: 0,
            openAIApiKey: apiKey,
          }),
        );
      case "anthropic":
        return Result.ok(
          new ChatAnthropic({
            modelName: definition["model"],
            temperature: 0,
            anthropicApiKey: apiKey,
          }),
        );
      default:
        return Result.error(new Error("Invalid agent LLM provider"));
    }
  }
}
