import { ExecutionContext } from "../services/context";

export type NodeType = "llm" | "entrypoint" | "result" | "code-executor";

export type NodeIOType = "text" | "image";

export interface NodeInput {
  source?: string; // Format: "nodeId.outputField" or "nodeId"
  type?: NodeIOType;
  required?: boolean;
  value?: any;
}

export interface NodeOutput {
  type: NodeIOType;
  notify: boolean;
}

export interface NodeDefinition {
  type: NodeType;
  inputs: Record<string, NodeInput>;
  outputs: Record<string, NodeOutput>;
  [key: string]: any; // for properties specific to each node type
}

export type NodeResultCallback = (
  nodeId: string,
  outputField: string,
  data: string,
  type: NodeIOType,
) => Promise<void>;

export interface INode {
  type: NodeType;
  execute(
    nodeId: string,
    definition: NodeDefinition,
    context: ExecutionContext,
    options: {
      onNodeResult: NodeResultCallback;
    },
  ): Promise<any>;
}
