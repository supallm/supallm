import { NodeDefinition, NodeExecutionResult, InputValue } from "./node";

export type WorkflowInputs = Record<string, InputValue>;

export interface WorkflowDefinition {
  version: string;
  nodes: Record<string, NodeDefinition>;
  edges?: Array<{
    source: string;
    sourceOutput: string;
    target: string;
    targetInput: string;
  }>;
  metadata?: {
    name?: string;
    description?: string;
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface WorkflowExecutionResult {
  workflowId: string;
  success: boolean;
  output: any;
  nodeResults: Record<string, NodeExecutionResult>;
  error?: string;
  executionTime: number;
}

export interface WorkflowExecutionCallbacks {
  onNodeStart?: (nodeId: string, nodeType: string) => Promise<void>;
  onNodeStream?: (
    nodeId: string,
    outputField: string,
    chunk: string
  ) => Promise<void>;
  onNodeComplete?: (nodeId: string, output: any) => Promise<void>;
  onNodeError?: (nodeId: string, error: Error) => Promise<void>;
}

export interface WorkflowExecutionOptions {
  inputs: WorkflowInputs;
  sessionId: string;
  triggerId: string;
}
