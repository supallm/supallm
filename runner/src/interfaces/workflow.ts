import { NodeDefinition, NodeExecutionResult } from "./node";

export interface WorkflowDefinition {
  nodes: Record<string, NodeDefinition>;
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
  inputs: Record<string, any>;
  sessionId: string;
  triggerId: string;
}
