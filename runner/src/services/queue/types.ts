export interface WorkflowMessage {
  workflow_id: string;
  trigger_id: string;
  session_id: string;
  project_id: string;
  definition: any;
  inputs: Record<string, any>;
}

// format: [messageId, consumerName, idleTime, deliveryCount]
export type PendingMessageInfo = [string, string, number, number];

export interface IQueueConsumer {
  initialize(): Promise<void>;
  consumeWorkflowQueue(
    handler: (message: WorkflowMessage) => Promise<void>
  ): Promise<void>;
  close(): Promise<void>;
}
