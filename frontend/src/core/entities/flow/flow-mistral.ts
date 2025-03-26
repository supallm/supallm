export type MistralAIAssistantMessage = {
  role: "assistant";
  content: {
    type: "text";
    text: string;
  };
};

export type MistralUserMessage = {
  role: "user";
  content: MistralUserMessageContent;
};

export type MistralUserMessageContent = {
  type: "text";
  text: string;
};

export type MistralUserMessageText = {
  role: "user";
  content: MistralUserMessageContent;
};

export const MistralModels = [
  "mistral-large-latest",
  "mistral-small-latest",
  "open-mistral-nemo",
  // "codestral-latest",
  // "mistral-saba-latest",
  // "ministral-3b-latest",
  // "mistral-embed",
  // "mistral-moderation-latest",
] as const;

export type MistralModel = (typeof MistralModels)[number];

export type MistralMessage = MistralUserMessage | MistralAIAssistantMessage;

export type MistralResponseFormat =
  | {
      type: "text";
    }
  | {
      type: "json_object";
    };

export type ChatMistralNodeData = {
  credentialId: string;
  providerType: "mistral";
  model: MistralModel;
  temperature: number | null; // optional, default 0, between 0 and 1
  outputMode: "text" | "text-stream";
  responseFormat: MistralResponseFormat;
};
