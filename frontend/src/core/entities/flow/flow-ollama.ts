export type OllamaAIAssistantMessage = {
  role: "assistant";
  content: {
    type: "text";
    text: string;
  };
};

export type OllamaUserMessage = {
  role: "user";
  content: OllamaUserMessageContent;
};

export type OllamaUserMessageContent = {
  type: "text";
  text: string;
};

export type OllamaUserMessageText = {
  role: "user";
  content: OllamaUserMessageContent;
};

export type OllamaResponseFormat =
  | {
      type: "text";
    }
  | {
      type: "json_object";
    };

export type OllamaMessage = OllamaUserMessage | OllamaAIAssistantMessage;

export type ChatOllamaNodeData = {
  model: string;
  baseUrl: string;
  providerType: "ollama";
  temperature: number | null; // optional, default 0, between 0 and 1
  systemPrompt: string;
  outputMode: "text" | "text-stream";
  responseFormat: OllamaResponseFormat;
};
