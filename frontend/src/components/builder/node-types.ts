export type NodeType =
  | "entrypoint"
  | "result"
  | "chat-openai"
  | "chat-anthropic"
  | "chat-google"
  | "chat-azure"
  | "chat-mistral"
  | "chat-ollama"
  | "e2b-interpreter"
  | "http-request"
  | "code-executor"
  | "user-feedback"
  | "local-memory"
  | "ai-agent"
  | "model-openai";
