import { ChatOpenAINodeData } from "./flow-openai";

export type FlowNodeType =
  | "chat-openai"
  | "entrypoint"
  | "result"
  | "chat-anthropic"
  | "chat-google"
  | "chat-azure";

export type FlowNodeData = ChatOpenAINodeData;

export type FlowNode = {
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
