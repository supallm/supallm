import { Result } from "typescript-result";
import { MemoryConfig } from "../memory/memory.interface";
import {
  WorkflowEvent,
  WorkflowEvents,
  WorkflowEventType,
} from "../services/notifier";
import { ToolConfig } from "../tools/tool.interface";
import { AgentType } from "./agent";

type LLMProvider =
  | "chat-openai"
  | "chat-anthropic"
  | "chat-mistral"
  | "chat-grok"
  | "chat-gemini"
  | "chat-deepseek"
  | "chat-ollama";

export type NodeType =
  | LLMProvider
  | "entrypoint"
  | "result"
  | "code-executor"
  | "ai-agent";

export type NodeIOType = "text" | "image" | "any";

export type NodeInput = Record<string, any>;
export type NodeOutput = Record<string, any>;

export interface NodeInputDef {
  source?: string; // Format: "nodeId.outputField" or "nodeId"
  type?: NodeIOType;
  value?: any;
}

export interface NodeOutputDef {
  type: NodeIOType;
  result_key?: string;
}

export interface NodeDefinition {
  type: NodeType;
  inputs: Record<string, NodeInputDef>;
  outputs: Record<string, NodeOutputDef>;
  tools: ToolConfig[] | undefined;
  memory: MemoryConfig;
  config: {
    agentType?: AgentType; // Type d'agent (tool ou react)
    instructions?: string; // Instructions pour l'agent
    apiKey: string; // Clé API pour le LLM
    model: string; // Modèle à utiliser
    provider: string; // Fournisseur du LLM
    [key: string]: any; // Autres configurations
  };
}

// Type des événements que les nodes peuvent émettre
export type NodeEventType = Extract<
  WorkflowEventType,
  | typeof WorkflowEvents.NODE_RESULT
  | typeof WorkflowEvents.AGENT_NOTIFICATION
  | typeof WorkflowEvents.NODE_LOG
  | typeof WorkflowEvents.TOOL_STARTED
  | typeof WorkflowEvents.TOOL_COMPLETED
  | typeof WorkflowEvents.TOOL_FAILED
>;

// Type pour les événements de node sans workflowId et triggerId
export type NodeEvent<T extends NodeEventType> = Omit<
  WorkflowEvent<T>,
  "workflowId" | "triggerId"
>;

export type NodeOptions = {
  sessionId: string;
  onEvent: <T extends NodeEventType>(
    type: T,
    data: Omit<NodeEvent<T>, "type" | "sessionId" | "nodeType" | "nodeId"> & {
      nodeId?: string;
    },
  ) => Promise<void>;
};

export interface INode {
  type: NodeType;
  execute(
    nodeId: string,
    definition: NodeDefinition,
    inputs: NodeInput,
    options: NodeOptions,
  ): Promise<Result<NodeOutput, Error>>;
}
