import { OpenAI } from "@langchain/openai";
import { LLMProvider, GenerationOptions } from "./llm-provider";

export class OpenAIProvider implements LLMProvider {
  private model: OpenAI;

  constructor(apiKey: string, modelName: string) {
    this.model = new OpenAI({
      openAIApiKey: apiKey,
      modelName: modelName || "gpt-4o-mini",
      temperature: 0.7,
    });
  }

  async generate(prompt: string, options?: GenerationOptions): Promise<string> {
    if (options) {
      this.model.temperature = options.temperature ?? this.model.temperature;
      this.model.maxTokens = options.maxTokens ?? this.model.maxTokens;
    }

    return await this.model.invoke(prompt);
  }

  async *generateStream(
    prompt: string,
    options?: GenerationOptions
  ): AsyncGenerator<string, void, unknown> {
    if (options) {
      this.model.temperature = options.temperature ?? this.model.temperature;
      this.model.maxTokens = options.maxTokens ?? this.model.maxTokens;
    }

    const stream = await this.model.stream(prompt);

    for await (const chunk of stream) {
      yield chunk;
    }
  }
}
