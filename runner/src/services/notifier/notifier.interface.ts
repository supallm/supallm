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

// Type helper pour extraire le type littéral des événements
export type WorkflowEventType =
  (typeof WorkflowEvents)[keyof typeof WorkflowEvents];

// Base commune pour tous les événements
interface BaseEventData {
  workflowId: string;
  sessionId: string;
  triggerId: string;
}

interface BaseNodeEventData extends BaseEventData {
  nodeId: string;
  nodeType: string;
}

// Type map qui associe chaque type d'événement à son payload
export type EventPayloadMap = {
  [WorkflowEvents.WORKFLOW_STARTED]: {
    inputs: NodeInput;
  };
  [WorkflowEvents.WORKFLOW_COMPLETED]: {
    result: Record<string, any> | null;
  };
  [WorkflowEvents.WORKFLOW_FAILED]: {
    error: string;
  };
  [WorkflowEvents.NODE_STARTED]: {
    inputs: NodeInput;
  };
  [WorkflowEvents.NODE_COMPLETED]: {
    inputs: NodeInput;
    output: NodeOutput;
  };
  [WorkflowEvents.NODE_FAILED]: {
    error: string;
  };
  [WorkflowEvents.TOOL_STARTED]: {
    agentName: string;
    toolName: string;
    input: Record<string, any>;
  };
  [WorkflowEvents.TOOL_COMPLETED]: {
    agentName: string;
    toolName: string;
    input: Record<string, any>;
    output: Record<string, any>;
  };
  [WorkflowEvents.TOOL_FAILED]: {
    agentName: string;
    toolName: string;
    error: string;
  };
  [WorkflowEvents.NODE_RESULT]: {
    outputField: string;
    ioType: NodeIOType;
    data: string;
  };
  [WorkflowEvents.NODE_LOG]: {
    message: string;
  };
  [WorkflowEvents.AGENT_NOTIFICATION]: {
    outputField: string;
    ioType: NodeIOType;
    data: string;
  };
};

// Type qui combine le type d'événement avec son payload correspondant
export type WorkflowEvent<T extends WorkflowEventType = WorkflowEventType> = {
  type: T;
} & (T extends keyof EventPayloadMap
  ? T extends
      | typeof WorkflowEvents.NODE_STARTED
      | typeof WorkflowEvents.NODE_COMPLETED
      | typeof WorkflowEvents.NODE_FAILED
      | typeof WorkflowEvents.TOOL_STARTED
      | typeof WorkflowEvents.TOOL_COMPLETED
      | typeof WorkflowEvents.TOOL_FAILED
      | typeof WorkflowEvents.NODE_RESULT
      | typeof WorkflowEvents.NODE_LOG
      | typeof WorkflowEvents.AGENT_NOTIFICATION
    ? BaseNodeEventData & EventPayloadMap[T]
    : BaseEventData & EventPayloadMap[T]
  : never);

export interface INotifier {
  initialize(): Promise<void>;
  publish<T extends WorkflowEventType>(
    event: WorkflowEvent<T>,
  ): Promise<string>;
  close(): Promise<void>;
}

// Type helper pour le handler d'événements
export type WorkflowEventHandler = <T extends WorkflowEventType>(
  event: WorkflowEvent<T>,
) => void | Promise<void>;
