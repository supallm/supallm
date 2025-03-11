export type NodeType = "llm" | "entrypoint" | "result";

export type InputValue =
  | { type: "string"; value: string }
  | { type: "file"; value: string; mimeType: string };

export interface NodeInput {
  type: string;
  source?: string; // format: "nodeId.outputField"
  required?: boolean;
  default?: InputValue;
}

export interface NodeOutput {
  type: string;
  outputField?: string;
}

export interface BaseNodeDefinition {
  type: NodeType;
  inputs?: Record<string, NodeInput>;
  outputs?: Record<string, NodeOutput>;
}

export interface LLMNodeDefinition extends BaseNodeDefinition {
  type: "llm";
  provider: string;
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  streaming?: boolean;
}

export type NodeDefinition = BaseNodeDefinition | LLMNodeDefinition;

export interface NodeExecutionResult {
  nodeId: string;
  success: boolean;
  output: any;
  error?: string;
  executionTime: number;
}

export interface ExecutionContext {
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  nodeResults: Record<string, NodeExecutionResult>;
  streamOutputs: Record<string, any>;
}
