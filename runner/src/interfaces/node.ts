export type NodeType = "llm" | "entrypoint" | "result";

export type NodeResultType = "string" | "image";

export interface NodeInput {
  type: string;
  source?: string; // format: "nodeId.outputField"
  required?: boolean;
}

export interface NodeOutput {
  type: string;
  outputField?: string[];
}

export interface NodeDefinition {
  type: NodeType;
  inputs: Record<string, NodeInput>;
  outputs?: Record<string, NodeOutput>;
  [key: string]: any; // for properties specific to each node type
}

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
}

export type NodeResultCallback = (
  nodeId: string,
  outputField: string,
  data: string,
  type: NodeResultType
) => Promise<void>;

export interface INode {
  type: NodeType;
  
  execute(
    nodeId: string,
    definition: NodeDefinition,
    context: ExecutionContext,
    callbacks: {
      onNodeResult: NodeResultCallback;
    }
  ): Promise<Record<string, any>>;
} 