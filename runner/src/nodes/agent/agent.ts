import { ChatAnthropic } from "@langchain/anthropic";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
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
import { logger } from "../../utils/logger";
import {
  INode,
  NodeDefinition,
  NodeInput,
  NodeOptions,
  NodeOutput,
  NodeType,
} from "../types";

const defaultInstructions = `You are a helpful AI assistant that can analyze the sentiment of text.

When a user provides text for sentiment analysis, you should:
1. Use the available sentiment analysis tool to analyze the text
2. Return the result (Positive, Negative, or Neutral)
3. If you need more context, ask for it politely

Do not mention anything about "missing tools" or "tool configuration" to the user - if you have access to the sentiment analysis tool, just use it.`;

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
      const [memory, memoryError] = MemoryRegistry.getInstance()
        .create(definition.memory || { type: "none" })
        .toTuple();
      if (memoryError) {
        return Result.error(memoryError);
      }

      const [llm, llmError] = this.createLLM(definition).toTuple();
      if (llmError) {
        return Result.error(llmError);
      }

      const langchainTools = this.convertToolsToLangChainFormat(
        definition.tools || [],
        options,
      );
      const toolNode = new ToolNode(langchainTools);
      const model = llm.bindTools(langchainTools);

      // Function to handle model calls
      async function callModel(state: typeof MessagesAnnotation.State) {
        // Create system message
        const systemMsg = new SystemMessage(
          definition.config["instructions"] || defaultInstructions,
        );

        // Check if the last message has tool_calls
        const lastMessage = state.messages[state.messages.length - 1];

        // Only process tool calls from the most recent AI message
        const toolCalls =
          lastMessage instanceof AIMessage ? lastMessage.tool_calls : undefined;
        if (toolCalls && toolCalls.length > 0) {
          const toolResponses = state.messages.filter(
            (msg): msg is ToolMessage => msg instanceof ToolMessage,
          );

          // Check if we have responses for all tool calls in the LAST message
          const missingToolCalls = toolCalls.filter(
            (toolCall) =>
              !toolResponses.some(
                (response) => response.tool_call_id === toolCall.id,
              ),
          );

          if (missingToolCalls.length > 0) {
            // Still waiting for some tool responses from the last message
            return { messages: state.messages };
          }
        }

        // All tool calls from the last message have been processed
        // Combine all messages, ensuring system message is first
        const allMessages = state.messages.some(
          (msg) => msg instanceof SystemMessage,
        )
          ? state.messages
          : [systemMsg, ...state.messages];

        const response = await model.invoke(allMessages);
        return { messages: allMessages.concat([response]) };
      }

      const workflow = new StateGraph(MessagesAnnotation)
        .addNode("agent", callModel)
        .addNode("tools", toolNode)
        .addEdge("tools", "agent")
        .addEdge("__start__", "agent")
        .addConditionalEdges("agent", this.shouldContinue);

      const app = workflow.compile();

      // Get conversation history
      const [historyMessages, historyError] = (
        await memory.getMessages(options.sessionId, nodeId)
      ).toTuple();
      if (historyError) {
        logger.error(
          `Failed to get conversation history: ${historyError.message}`,
        );
      }

      // Create system message
      const systemMsg = new SystemMessage(
        definition.config["instructions"] || defaultInstructions,
      );

      // Combine history with system message and new input
      const initialMessages = [
        systemMsg,
        ...(historyMessages || []),
        new HumanMessage(inputs["prompt"]),
      ];

      try {
        const stream = await app.streamEvents(
          { messages: initialMessages },
          {
            version: "v2",
            configurable: {
              sessionId: options.sessionId,
              nodeId: nodeId,
            },
            streamMode: ["messages"],
          },
        );

        let finalResponse = "";

        for await (const event of stream) {
          if (event.event === "on_chat_model_stream") {
            const content = event.data.chunk.text;
            if (typeof content === "string") {
              options.onEvent("NODE_RESULT", {
                outputField: "response",
                ioType: "text",
                data: content,
              });
              finalResponse += content;
            }
          }
        }

        // Save the final conversation turn to memory
        await memory.addMessages(options.sessionId, nodeId, [
          new HumanMessage(inputs["prompt"]),
          new AIMessage(finalResponse),
        ]);

        return Result.ok({ response: finalResponse });
      } catch (error) {
        return Result.error(new Error(`agent execution failed: ${error}`));
      }
    } catch (error) {
      return Result.error(new Error(`agent execution failed: ${error}`));
    }
  }

  private shouldContinue({ messages }: typeof MessagesAnnotation.State) {
    const lastMessage = messages[messages.length - 1] as AIMessage;
    if (lastMessage.tool_calls?.length) {
      return "tools";
    }
    return "__end__";
  }

  private convertToolsToLangChainFormat(
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
