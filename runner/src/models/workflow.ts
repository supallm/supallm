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
    executionMode: "sequential" | "parallel";
    errorHandling: "stopOnError" | "continueOnError";
    timeout: number;
  };
}

export interface NodeDefinition {
  id: string;
  type: string;
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
}
