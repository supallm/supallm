export type OpenAIAIAssistantMessage = {
  role: "assistant";
  content: {
    type: "text";
    text: string;
  };
};

export type OpenAIUserMessage = {
  role: "user";
  content: OpenAIUserMessageContent;
};

export type OpenAIUserMessageContent = {
  type: "text";
  text: string;
};

export type OpenAIUserMessageText = {
  role: "user";
  content: OpenAIUserMessageContent;
};

export type OpenAIResponseFormat =
  | {
      type: "text";
    }
  | {
      type: "json_object";
    };
// Later we can add support for json_schema
//   | {
//       type: "json_schema";
//       schema: string;
//       strict: boolean;
//       name: string;
//     };

export const OpenAIModels = ["gpt-4o", "gpt-4o-mini"] as const;

export type OpenAIModel = (typeof OpenAIModels)[number];

export type OpenAIMessage = OpenAIUserMessage | OpenAIAIAssistantMessage;

export type ChatOpenAIAsToolNodeData = {
  credentialId: string;
  providerType: "openai";
  model: OpenAIModel;
  temperature: number | null;
  maxCompletionTokens: number | null;
  developerMessage: string;
  imageResolution: "low" | "high" | "auto";
  responseFormat: OpenAIResponseFormat;
};
