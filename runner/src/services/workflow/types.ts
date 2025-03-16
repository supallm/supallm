import { NodeDefinition, NodeExecutionResult } from "../../interfaces/node";

export interface WorkflowInputs {
  [key: string]: any;
}

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

export interface WorkflowExecutionOptions {
  inputs: WorkflowInputs;
  sessionId: string;
  triggerId: string;
}
