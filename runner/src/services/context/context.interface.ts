export interface NodeExecutionResult {
  nodeId: string;
  success: boolean;
  output: Record<string, any> | null;
  error?: string;
  executionTime: number;
}

export interface ExecutionContext {
  inputs: Record<string, any>;
  outputs: Record<string, Record<string, any>>;
  nodeResults: Record<string, NodeExecutionResult>;
  completedNodes: Set<string>;
  allNodes: Set<string>;
  workflowId: string;
  sessionId: string;
  triggerId: string;
}

export interface IContextService {
  initialize(
    workflowId: string, 
    context: ExecutionContext
  ): Promise<void>;
  
  getContext(
    workflowId: string
  ): Promise<ExecutionContext | null>;
  
  updateContext(
    workflowId: string,
    update: Partial<ExecutionContext>
  ): Promise<void>;
  
  markNodeCompleted(
    workflowId: string,
    nodeId: string
  ): Promise<void>;
  
  deleteContext(
    workflowId: string
  ): Promise<void>;
} 