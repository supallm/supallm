export type OpenAIModelNodeData = {
  credentialId: string;
  model: "gpt-4o" | "gpt-4o-mini";
  temperature: number;
  maxCompletionToken: number;
};
