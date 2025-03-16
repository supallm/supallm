export interface LLMOptions {
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  streaming?: boolean;
  nodeId?: string;
}

export interface BaseLLMProvider {
  generate(
    prompt: string,
    options: LLMOptions
  ): Promise<AsyncIterable<{ content: string }>>;
}
