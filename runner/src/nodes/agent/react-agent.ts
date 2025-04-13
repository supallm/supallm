import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { Result } from "typescript-result";
import { MemoryRegistry } from "../../memory/memory-registry";
import { logger } from "../../utils/logger";
import { NodeDefinition, NodeInput, NodeOptions, NodeOutput } from "../types";
import { BaseAgent } from "./base-agent";

const defaultInstructions = `You are a helpful AI assistant that follows the ReAct framework to solve tasks step by step.

Follow these steps for each task:
1. **Thought**: First, write out your thought process about how to solve the task
2. **Action**: Then, specify which tool you'll use and why
3. **Observation**: After using a tool, analyze its results
4. **Thought**: Based on the observation, decide what to do next
5. **Action/Final Answer**: Either take another action or provide the final answer

Remember to:
- Break down complex tasks into steps
- Show your reasoning at each step
- Use tools when needed without asking permission
- Be clear about what you're doing and why

Here the user instructions:`;

export class ReActAgent extends BaseAgent {
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

      const agent = createReactAgent({
        llm,
        tools: langchainTools,
        prompt: defaultInstructions + (definition.config["instructions"] || ""),
      });

      const [historyMessages, historyError] = (
        await memory.getMessages(options.sessionId, nodeId)
      ).toTuple();
      if (historyError) {
        logger.error(
          `Failed to get conversation history: ${historyError.message}`,
        );
      }

      const initialMessages = [
        ...(historyMessages || []),
        new HumanMessage(inputs["prompt"]),
      ];

      try {
        const stream = await agent.streamEvents(
          {
            messages: initialMessages,
          },
          {
            configurable: {
              sessionId: options.sessionId,
              nodeId: nodeId,
            },
            version: "v2",
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
          } else if (event.event === "on_tool_start") {
            options.onEvent("AGENT_NOTIFICATION", {
              outputField: "thought_process",
              ioType: "text",
              data: `Thought: Utilisation d'un outil pour résoudre cette étape...`,
            });
          } else if (event.event === "on_tool_end") {
            const toolEvent = event.data as { output: string };
            options.onEvent("AGENT_NOTIFICATION", {
              outputField: "thought_process",
              ioType: "text",
              data: `Observation: ${toolEvent.output}
Thought: Analysons ce résultat...`,
            });
          }
        }

        // Sauvegarder la conversation
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
}
