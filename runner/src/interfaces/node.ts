export type NodeType = "llm" | "entrypoint" | "result" | "transform" | "merge";

export interface NodeInput {
  type: string;
  source?: string;
  required?: boolean;
}

export interface NodeOutput {
  type: string;
  propagateToOutput?: boolean;
  outputField?: string;
}

export interface NodeDefinition {
  id: string;
  type: NodeType;
  inputs?: Record<string, NodeInput>;
  outputs?: Record<string, NodeOutput>;
  [key: string]: any;
}

export interface NodeExecutionResult {
  nodeId: string;
  success: boolean;
  output: any;
  error?: string;
  executionTime: number;
}

export interface INode {
  type: NodeType;
  execute(
    nodeId: string,
    definition: NodeDefinition,
    inputs: Record<string, any>,
    context: ExecutionContext,
    callbacks?: {
      onNodeStream?: (
        nodeId: string,
        outputField: string,
        chunk: string
      ) => Promise<void>;
    }
  ): Promise<any>;
}

export interface ExecutionContext {
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  nodeResults: Record<string, NodeExecutionResult>;
  streamOutputs: Record<string, any>;
}
