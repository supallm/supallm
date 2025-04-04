export const ToolNodeTypes = [
  "http-tool",
  "chat-openai-as-tool",
  "sdk-notifier-tool",
  "e2b-interpreter-tool",
  "e2b-code-interpreter-tool",
  "notion-database-tool",
  "postgres-query-tool",
  "confluence-tool",
] as const;
export const UtilityNodeTypes = ["local-memory", "model-openai"] as const;

export type ToolNodeType = (typeof ToolNodeTypes)[number];

export type UtilityNodeType = (typeof UtilityNodeTypes)[number];

export const RunningFlowNodeTypes = [
  "entrypoint",
  "result",
  "chat-openai",
  "chat-anthropic",
  "chat-google",
  "chat-azure",
  "chat-mistral",
  "chat-ollama",
  "code-executor",
  "user-feedback",
  "ai-agent",
] as const;

export const isRunningFlowNodeType = (
  nodeType: string,
): nodeType is RunningFlowNodeType => {
  return RunningFlowNodeTypes.includes(nodeType as RunningFlowNodeType);
};

export type RunningFlowNodeType = (typeof RunningFlowNodeTypes)[number];

export type NodeType = RunningFlowNodeType | ToolNodeType | UtilityNodeType;
