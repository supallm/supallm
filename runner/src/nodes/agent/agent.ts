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
import { logger } from "../../utils/logger";
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
        definition.tools || [],
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
        .addConditionalEdges("agent", this.shouldContinue);

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

      const stream = app.streamEvents(
        { messages: initialMessages },
        { version: "v2" },
      );

      let finalResponse = "";
      for await (const event of stream) {
        const { name, id } = this.parseToolName(event.name);
        switch (event.event) {
          case "on_chat_model_stream":
            const content =
              typeof event.data.chunk.text === "string"
                ? event.data.chunk.text
                : JSON.stringify(event.data.chunk.text);

            options.onEvent("NODE_RESULT", {
              outputField: "response",
              ioType: "text",
              data: content,
            });
            finalResponse += content;
            break;

          case "on_tool_start":
            let parsedStartInput = event.data.input;
            if (typeof parsedStartInput === "string") {
              try {
                parsedStartInput = JSON.parse(parsedStartInput);
              } catch (e: unknown) {
                const error = e as Error;
                logger.error(
                  `Failed to parse tool start input: ${error.message}`,
                  {
                    input: parsedStartInput,
                    error,
                  },
                );
              }
            }

            options.onEvent("TOOL_STARTED", {
              agentName: "default",
              toolName: name,
              inputs: parsedStartInput?.input || parsedStartInput,
              nodeId: id,
            });
            break;
          case "on_tool_end":
            let parsedEndInput = event.data.input;
            if (typeof parsedEndInput === "string") {
              try {
                parsedEndInput = JSON.parse(parsedEndInput);
              } catch (e: unknown) {
                const error = e as Error;
                logger.error(
                  `Failed to parse tool end input: ${error.message}`,
                  {
                    input: parsedEndInput,
                    error,
                  },
                );
              }
            }

            options.onEvent("TOOL_COMPLETED", {
              agentName: "default",
              toolName: name,
              output: event.data.output?.content,
              inputs: parsedEndInput?.input || parsedEndInput,
              nodeId: id,
            });
            break;
          case "on_error":
        }
      }

      return Result.ok({ response: finalResponse });
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
    nodeId: string,
    tools: ToolConfig[],
    options: NodeOptions,
  ): DynamicStructuredTool<any>[] {
    return tools.map((toolConfig) => {
      const [tool, toolError] = ToolRegistry.create(toolConfig, {
        nodeId,
        sessionId: options.sessionId,
        nodeOptions: options,
      }).toTuple();
      if (toolError) {
        throw toolError;
      }

      return new DynamicStructuredTool({
        name: `${tool.name}____${tool.id}`,
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

  private parseToolName(toolName: string): { name: string; id: string } {
    const [name, id] = toolName.split("____");
    if (!name || !id) {
      return {
        name: toolName,
        id: "unknown",
      };
    }
    return {
      name,
      id,
    };
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
