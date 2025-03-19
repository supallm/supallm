import { NodeDefinition } from "../../interfaces/node";
import { NodeExecutionResult } from "../context";

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
  projectId: string;
  sessionId: string;
  triggerId: string;
}
