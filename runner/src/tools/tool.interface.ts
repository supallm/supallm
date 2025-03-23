import { BaseMessage } from "@langchain/core/messages";
import { Result } from "typescript-result";
import { NodeType } from "../nodes/types";

export type ToolType = "memory" | "retrieval";

export type MemoryToolAction = "load" | "append";
export type MemoryToolParams = {
  sessionId: string;
  nodeId: string;
  messages?: BaseMessage[];
};
export type MemoryToolOutput = BaseMessage[] | null;

export type Params = MemoryToolParams;
export type RunOutput = MemoryToolOutput;

export type ToolAction = MemoryToolAction;

export interface Tool<T = RunOutput> {
  id: string;
  type: ToolType;
  canHandle(nodeType: NodeType): boolean;
  run(action: ToolAction, params: Params): Promise<Result<T, Error>>;
}
