export interface LLMOptions {
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  streaming?: boolean;
  nodeId?: string;
  callbacks: {
    onNodeStream: (
      nodeId: string,
      outputField: string,
      chunk: string,
      type: "string" | "image"
    ) => Promise<void>;
  };
}

export interface BaseLLMProvider {
  generate(prompt: string, options: LLMOptions): Promise<{ response: string }>;
  stream(
    prompt: string,
    options: LLMOptions
  ): Promise<AsyncIterable<{ content?: string; text?: string }>>;
}
