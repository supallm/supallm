import { EntrypointNodeData } from "./flow-entrypoint";
import { ChatOpenAINodeData } from "./flow-openai";
import { ResultNodeData } from "./flow-result";

export type FlowNodeType =
  | "chat-openai"
  | "entrypoint"
  | "result"
  | "chat-anthropic"
  | "chat-google"
  | "chat-azure";

export type FlowNodeData =
  | ChatOpenAINodeData
  | ResultNodeData
  | EntrypointNodeData;

export type FlowNode = {
  id: string;
  type: FlowNodeType;
  data: FlowNodeData;
  position: { x: number; y: number };
  zIndex: number;
  deletable: boolean;
};

export type RunFlowNode = {
  id: string;
  type: FlowNodeType;
  data: FlowNodeData;
  position: { x: number; y: number };
  zIndex: number;
  deletable: boolean;
};

export type FlowEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
};

export type Flow = {
  id: string;
  name: string;
  projectId: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
};
