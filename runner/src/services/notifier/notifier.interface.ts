export interface WorkflowEvent {
  type: string;
  workflowId: string;
  triggerId: string;
  sessionId: string;
  data?: Record<string, any>;
}

export interface INotifier {
  initialize(): Promise<void>;
  publishEvent(event: WorkflowEvent): Promise<string>;
  close(): Promise<void>;
}
