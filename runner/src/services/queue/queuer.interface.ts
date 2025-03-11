import { WorkflowDefinition } from "../../interfaces/workflow";

export interface WorkflowMessage {
  workflow_id: string;
  trigger_id: string;
  project_id: string;
  definition: WorkflowDefinition;
  inputs: Record<string, any>;
}

export interface IQueueConsumer {
  initialize(): Promise<void>;
  consumeWorkflowQueue(
    handler: (message: WorkflowMessage) => Promise<void>
  ): void;
  close(): Promise<void>;
}
