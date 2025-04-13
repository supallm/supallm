import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { Result } from "typescript-result";
import { MemoryRegistry } from "../../memory/memory-registry";
import { logger } from "../../utils/logger";
import { NodeDefinition, NodeInput, NodeOptions, NodeOutput } from "../types";
import { BaseAgent } from "./base-agent";

const defaultInstructions = `You are a helpful AI assistant that can use various tools to help users.

When responding to users:
1. If you have access to relevant tools that could help answer the query, use them immediately without asking for permission
2. Start responding while you're using the tools
3. Incorporate the tool results naturally into your response
4. Be direct and action-oriented - don't announce what you're going to do, just do it
5. Never ask for confirmation before using a tool
6. If you need more context, just use the tools you have to gather it

Remember: You have been given these tools for a reason - use them proactively to help the user.`;

export class ToolAgent extends BaseAgent {
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
        const systemMsg = new SystemMessage(
          definition.config["instructions"] || defaultInstructions,
        );

        const allMessages = state.messages.some(
          (msg) => msg instanceof SystemMessage,
        )
          ? state.messages
          : [systemMsg, ...state.messages];

        const lastMessage = state.messages[state.messages.length - 1];
        const toolCalls =
          lastMessage instanceof AIMessage ? lastMessage.tool_calls : undefined;

        if (toolCalls && toolCalls.length > 0) {
          const toolResponses = state.messages.filter(
            (msg): msg is ToolMessage => msg instanceof ToolMessage,
          );

          const pendingTools = toolCalls.filter(
            (toolCall) =>
              !toolResponses.some(
                (response) => response.tool_call_id === toolCall.id,
              ),
          );

          if (pendingTools.length === 0) {
            const response = await model.invoke(allMessages);
            return { messages: allMessages.concat([response]) };
          }

          return { messages: state.messages };
        }

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

      const [historyMessages, historyError] = (
        await memory.getMessages(options.sessionId, nodeId)
      ).toTuple();
      if (historyError) {
        logger.error(
          `Failed to get conversation history: ${historyError.message}`,
        );
      }

      const systemMsg = new SystemMessage(
        definition.config["instructions"] || defaultInstructions,
      );

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
}
