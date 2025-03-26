export type AnthropicAIAssistantMessage = {
  role: "assistant";
  content: {
    type: "text";
    text: string;
  };
};

export type AnthropicUserMessage = {
  role: "user";
  content: AnthropicUserMessageContent;
};

export type AnthropicUserMessageContent = {
  type: "text";
  text: string;
};

export type AnthropicUserMessageText = {
  role: "user";
  content: AnthropicUserMessageContent;
};

export const AnthropicModels = [
  "claude-3-7-sonnet-latest",
  "claude-3-5-haiku-latest",
  "claude-3-opus-latest",
] as const;

export type AnthropicModel = (typeof AnthropicModels)[number];

export type AnthropicMessage =
  | AnthropicUserMessage
  | AnthropicAIAssistantMessage;

export type ChatAnthropicNodeData = {
  credentialId: string;
  providerType: "anthropic";
  model: AnthropicModel;
  temperature: number | null; // optiona, default 0, between 0 and 1
  maxTokenToSample: number | null; // optional,min 1
  systemPrompt: string;
  outputMode: "text" | "text-stream";
};
