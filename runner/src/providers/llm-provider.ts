export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

export interface LLMProvider {
  generate(prompt: string, options?: GenerationOptions): Promise<string>;
  generateStream(
    prompt: string,
    options?: GenerationOptions
  ): AsyncGenerator<string, void, unknown>;
}
