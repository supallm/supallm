export const ToolNodeTypes = [
  "http-tool",
  "chat-openai-as-tool",
  "sdk-notifier-tool",
  "e2b-interpreter-tool",
  "e2b-code-interpreter-tool",
  "notion-database-tool",
  "postgres-query-tool",
  "confluence-tool",
  "airtable-tool",
  "slack-tool",
  "firecrawl-tool",
  "brave-search-tool",
] as const;
export const UtilityNodeTypes = ["local-memory", "model-openai"] as const;

export type ToolNodeType = (typeof ToolNodeTypes)[number];

export type UtilityNodeType = (typeof UtilityNodeTypes)[number];

export const MainNodeTypes = [
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

type MainNodeType = (typeof MainNodeTypes)[number];

export const isMainNodeType = (nodeType: string): nodeType is MainNodeType => {
  return MainNodeTypes.includes(nodeType as MainNodeType);
};

export const isToolNodeType = (nodeType: string): nodeType is ToolNodeType => {
  return ToolNodeTypes.includes(nodeType as ToolNodeType);
};

export const isRunningFlowNodeType = (
  nodeType: string,
): nodeType is RunningFlowNodeType => {
  return isMainNodeType(nodeType) || isToolNodeType(nodeType);
};

export type RunningFlowNodeType = MainNodeType | ToolNodeType;

export type NodeType = RunningFlowNodeType | ToolNodeType | UtilityNodeType;
