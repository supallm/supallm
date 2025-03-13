export { RedisNotifier } from "./redis-notifier";
export type { WorkflowEvent, INotifier } from "./notifier.interface";

export const NotifierEvent = {
  WORKFLOW_STARTED: "WORKFLOW_STARTED",
  WORKFLOW_COMPLETED: "WORKFLOW_COMPLETED",
  WORKFLOW_FAILED: "WORKFLOW_FAILED",
  NODE_STARTED: "NODE_STARTED",
  NODE_RESULT: "NODE_RESULT",
  NODE_COMPLETED: "NODE_COMPLETED",
  NODE_FAILED: "NODE_FAILED",
};
