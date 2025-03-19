import { NodeInput, NodeIOType, NodeOutput } from "../../nodes/types";

export const WorkflowEvents = {
  WORKFLOW_STARTED: "WORKFLOW_STARTED",
  WORKFLOW_COMPLETED: "WORKFLOW_COMPLETED",
  WORKFLOW_FAILED: "WORKFLOW_FAILED",

  NODE_STARTED: "NODE_STARTED",
  NODE_COMPLETED: "NODE_COMPLETED",
  NODE_FAILED: "NODE_FAILED",

  NODE_RESULT: "NODE_RESULT",
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
  publishNodeResult(event: WorkflowEvent): Promise<string>;
  close(): Promise<void>;
}

interface BaseEventData {
  workflowId: string;
  sessionId: string;
  triggerId: string;
}

interface BaseNodeEvent extends BaseEventData {
  nodeId: string;
  nodeType: string;
}

interface WorkflowStartedEvent extends BaseEventData {
  inputs: NodeInput;
}

interface WorkflowCompletedEvent extends BaseEventData {
  result: Record<string, any> | null;
}

interface WorkflowFailedEvent extends BaseEventData {
  error: string;
}

interface NodeStartedEvent extends BaseNodeEvent {
  inputs: NodeInput;
}

interface NodeCompletedEvent extends BaseNodeEvent {
  output: NodeOutput;
}

interface NodeFailedEvent extends BaseNodeEvent {
  error: string;
}

interface NodeResultEvent extends BaseNodeEvent {
  outputField: string;
  type: NodeIOType;
  data: string;
}

export interface WorkflowExecutorEvents {
  [WorkflowEvents.WORKFLOW_STARTED]: (event: WorkflowStartedEvent) => void;
  [WorkflowEvents.WORKFLOW_COMPLETED]: (event: WorkflowCompletedEvent) => void;
  [WorkflowEvents.WORKFLOW_FAILED]: (event: WorkflowFailedEvent) => void;
  [WorkflowEvents.NODE_STARTED]: (event: NodeStartedEvent) => void;
  [WorkflowEvents.NODE_RESULT]: (event: NodeResultEvent) => void;
  [WorkflowEvents.NODE_COMPLETED]: (event: NodeCompletedEvent) => void;
  [WorkflowEvents.NODE_FAILED]: (event: NodeFailedEvent) => void;
}
