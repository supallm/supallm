export interface WorkflowDefinition {
  chain: {
    id: string;
    name: string;
    type: string;
  };
  nodes: Record<string, NodeDefinition>;
  connections: ConnectionDefinition[];
  metadata: Record<string, any>;
  configuration: {
    executionMode: "sequential" | "parallel" | "mixed";
    errorHandling: "stopOnError" | "continueOnError";
    timeout: number;
  };
}

export enum NodeType {
  LLM = "llm",
  ENTRYPOINT = "entrypoint",
  RESULT = "result",
  TRANSFORM = "transform",
  MERGE = "merge",
}

export interface NodeDefinition {
  id: string;
  type: NodeType;
  streaming?: boolean;
  provider?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  parameters?: Record<string, any>;
  auth?: {
    provider: string;
    apiKey?: string;
  };
  code?: string;
  [key: string]: any;
}

export interface ConnectionDefinition {
  from: string;
  to: string;
  fromPort?: string;
  toPort?: string;
  dataType?: string;
}

export interface WorkflowExecutionResult {
  workflowId: string;
  success: boolean;
  output: any;
  nodeResults: Record<string, NodeExecutionResult>;
  error?: string;
  executionTime: number;
}

export interface NodeExecutionResult {
  nodeId: string;
  success: boolean;
  output: any;
  error?: string;
  executionTime: number;
}

export interface WorkflowExecutionOptions {
  inputs?: Record<string, any>;
  timeout?: number;
  sessionId?: string;
  credentials?: Record<string, any>;
}

export interface ExecutionContext {
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  nodeResults: Record<string, NodeExecutionResult>;
  credentials?: Record<string, any>;
}
