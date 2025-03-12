export interface WorkflowEvent {
  type: string;
  workflowId: string;
  triggerId: string;
  sessionId: string;
  data: Record<string, any>;
}

export interface INotifier {
  initialize(): Promise<void>;
  publishWorkflowEvent(event: WorkflowEvent): Promise<string[]>;
  publishNodeResult(event: WorkflowEvent): Promise<string>;
  close(): Promise<void>;
}
