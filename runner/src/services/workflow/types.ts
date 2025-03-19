import { NodeDefinition } from "../../nodes/types";
import { NodeExecutionResult } from "../context";
import { WorkflowInputs } from "../context/context.interface";

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
