import { Result } from "typescript-result";
import { Tool } from "../tools";

type LLMProvider =
  | "chat-openai"
  | "chat-anthropic"
  | "chat-mistral"
  | "chat-grok"
  | "chat-gemini"
  | "chat-deepseek"
  | "chat-ollama";

export type NodeType = LLMProvider | "entrypoint" | "result" | "code-executor";

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
  [key: string]: any; // for properties specific to each node type
}

export type NodeResultCallback = (
  nodeId: string,
  outputField: string,
  data: string,
  type: NodeIOType,
) => Promise<void>;

export type NodeLogCallback = (
  nodeId: string,
  message: string,
) => Promise<void>;

export type NodeOptions = {
  sessionId: string;
  onNodeResult: NodeResultCallback;
  onNodeLog: NodeLogCallback;
};

export interface INode {
  type: NodeType;
  execute(
    nodeId: string,
    definition: NodeDefinition,
    inputs: NodeInput,
    tools: Record<string, Tool>,
    options: NodeOptions,
  ): Promise<Result<NodeOutput, Error>>;
}
