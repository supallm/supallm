import { NodeInput, NodeIOType, NodeOutput } from "../../nodes/types";

export const WorkflowEvents = {
  WORKFLOW_STARTED: "WORKFLOW_STARTED",
  WORKFLOW_COMPLETED: "WORKFLOW_COMPLETED",
  WORKFLOW_FAILED: "WORKFLOW_FAILED",

  NODE_STARTED: "NODE_STARTED",
  NODE_COMPLETED: "NODE_COMPLETED",
  NODE_FAILED: "NODE_FAILED",

  TOOL_STARTED: "TOOL_STARTED",
  TOOL_COMPLETED: "TOOL_COMPLETED",
  TOOL_FAILED: "TOOL_FAILED",

  NODE_RESULT: "NODE_RESULT",
  NODE_LOG: "NODE_LOG",
  AGENT_NOTIFICATION: "AGENT_NOTIFICATION",
} as const;

export interface WorkflowEvent {
  type: (typeof WorkflowEvents)[keyof typeof WorkflowEvents];
  workflowId: string;
  triggerId: string;
  sessionId: string;
  data: Record<string, any>;
}

export interface INotifier {
  initialize(): Promise<void>;
  publishWorkflowEvent(event: WorkflowEvent): Promise<string>;
  publishNodeEvent(event: WorkflowEvent): Promise<string>;
  close(): Promise<void>;
}

export interface BaseEventData {
  workflowId: string;
  sessionId: string;
  triggerId: string;
}

export interface BaseNodeEvent extends BaseEventData {
  nodeId: string;
  nodeType: string;
}

export interface WorkflowStartedEvent extends BaseEventData {
  inputs: NodeInput;
}

export interface WorkflowCompletedEvent extends BaseEventData {
  result: Record<string, any> | null;
}

export interface WorkflowFailedEvent extends BaseEventData {
  error: string;
}

export interface NodeStartedEvent extends BaseNodeEvent {
  inputs: NodeInput;
}

export interface NodeCompletedEvent extends BaseNodeEvent {
  output: NodeOutput;
}

export interface NodeFailedEvent extends BaseNodeEvent {
  error: string;
}

export interface ToolStartedEvent extends BaseNodeEvent {
  toolName: string;
  toolInput: Record<string, any>;
}

export interface ToolCompletedEvent extends BaseNodeEvent {
  toolName: string;
  toolOutput: Record<string, any>;
}

export interface ToolFailedEvent extends BaseNodeEvent {
  toolName: string;
  error: string;
}

export interface NodeResultEvent extends BaseNodeEvent {
  outputField: string;
  type: NodeIOType;
  data: string;
}

export interface AgentNotificationEvent extends BaseNodeEvent {
  outputField: string;
  type: NodeIOType;
  data: string;
}

export interface NodeLogEvent extends BaseNodeEvent {
  message: string;
}

export interface WorkflowExecutorEvents {
  [WorkflowEvents.WORKFLOW_STARTED]: (event: WorkflowStartedEvent) => void;
  [WorkflowEvents.WORKFLOW_COMPLETED]: (event: WorkflowCompletedEvent) => void;
  [WorkflowEvents.WORKFLOW_FAILED]: (event: WorkflowFailedEvent) => void;
  [WorkflowEvents.NODE_STARTED]: (event: NodeStartedEvent) => void;
  [WorkflowEvents.NODE_RESULT]: (event: NodeResultEvent) => void;
  [WorkflowEvents.NODE_COMPLETED]: (event: NodeCompletedEvent) => void;
  [WorkflowEvents.TOOL_STARTED]: (event: ToolStartedEvent) => void;
  [WorkflowEvents.TOOL_COMPLETED]: (event: ToolCompletedEvent) => void;
  [WorkflowEvents.TOOL_FAILED]: (event: ToolFailedEvent) => void;
  [WorkflowEvents.NODE_FAILED]: (event: NodeFailedEvent) => void;
  [WorkflowEvents.NODE_LOG]: (event: NodeLogEvent) => void;
  [WorkflowEvents.AGENT_NOTIFICATION]: (event: AgentNotificationEvent) => void;
}
