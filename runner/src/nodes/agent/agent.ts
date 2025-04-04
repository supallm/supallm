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
import { MemoryRegistry } from "../../memory/memory-registry";
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

const defaultInstructions = "You are a helpful AI assistant.";

export class Agent implements INode {
  type: NodeType = "ai-agent";
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
        nodeId,
        definition.tools,
        options,
      );
      const toolNode = new ToolNode(langchainTools);
      const model = llm.bindTools(langchainTools);

      // Get memory instance from registry
      const [memory, memoryError] = MemoryRegistry.getInstance()
        .create(definition.memory || { type: "none" })
        .toTuple();
      if (memoryError) {
        return Result.error(memoryError);
      }

      function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
        const lastMessage = messages[messages.length - 1] as AIMessage;
        if (lastMessage.tool_calls?.length) {
          return "tools";
        }
        return "__end__";
      }

      async function callModel(state: typeof MessagesAnnotation.State) {
        if (!memory) {
          throw new Error("memory instance not initialized");
        }

        const lastMessage = state.messages[state.messages.length - 1];
        const hasToolCalls =
          lastMessage &&
          "tool_calls" in lastMessage &&
          Array.isArray(lastMessage.tool_calls) &&
          lastMessage.tool_calls.length > 0;

        if (hasToolCalls) {
          const response = await model.invoke(state.messages);
          return { messages: [...state.messages, response] };
        }

        const [messages, loadError] = (
          await memory.getMessages(options.sessionId, nodeId)
        ).toTuple();
        if (loadError) {
          throw loadError;
        }

        const response = await model.invoke([...messages, ...state.messages]);
        await memory.addMessages(options.sessionId, nodeId, [response]);
        return { messages: [...state.messages, response] };
      }

      const workflow = new StateGraph(MessagesAnnotation)
        .addNode("agent", callModel)
        .addNode("tools", toolNode)
        .addEdge("tools", "agent")
        .addEdge("__start__", "agent")
        .addConditionalEdges("agent", shouldContinue);

      const app = workflow.compile();

      const initialMessages = [
        new SystemMessage(
          definition.config["instructions"] || defaultInstructions,
        ),
        new HumanMessage(inputs["prompt"]),
      ];

      if (memory) {
        const [saveError] = (
          await memory.addMessages(options.sessionId, nodeId, initialMessages)
        ).toTuple();
        if (saveError) {
          return Result.error(saveError);
        }
      }

      const finalState = await app.invoke({
        messages: initialMessages,
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
      return Result.error(new Error(`agent execution failed: ${error}`));
    }
  }

  private convertToolsToLangChainFormat(
    nodeId: string,
    tools: ToolConfig[],
    options: NodeOptions,
  ): DynamicStructuredTool<any>[] {
    return tools.map((toolConfig) => {
      const [tool, toolError] = ToolRegistry.create(toolConfig, {
        nodeId,
        sessionId: options.sessionId,
        onAgentNotification: options.onAgentNotification,
      }).toTuple();
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
