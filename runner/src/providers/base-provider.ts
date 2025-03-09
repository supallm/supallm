/**
 * Base interface for all LLM providers
 */
export interface BaseLLMProvider {
  /**
   * Generate text from a prompt
   * @param prompt The prompt to generate from
   * @param options Additional options for generation
   * @returns The generated text and any additional metadata
   */
  generate(prompt: string | any, options?: any): Promise<any>;
}
