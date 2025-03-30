import { ChatOpenAI } from "@langchain/openai";
import { Result } from "typescript-result";
import { z } from "zod";
import { CryptoService } from "../services/secret/crypto-service";
import { logger } from "../utils/logger";
import {
  SentimentToolOutput,
  SentimentToolParams,
  Tool,
  ToolConfig,
  ToolType,
} from "./tool.interface";

const defaultInstructions =
  "You are an AI that performs sentiment analysis on text inputs. Given a sentence, you must classify it as Positive, Negative, or Neutral. Respond with only one word: Positive, Negative, or Neutral.";

export class SentimentTool implements Tool<SentimentToolOutput> {
  private llm: ChatOpenAI;
  private cryptoService: CryptoService;
  private instructions: string;
  type: ToolType = "sentiment";

  name: string;
  description: string;

  schema: z.ZodSchema = z.object({
    input: z.string().describe("The input for the tool"),
  });

  constructor(config: ToolConfig) {
    this.cryptoService = new CryptoService();

    const [decryptedApiKeyResult, decryptedApiKeyError] = this.cryptoService
      .decrypt(config["apiKey"])
      .toTuple();
    if (decryptedApiKeyError) {
      throw decryptedApiKeyError;
    }

    const apiKey = decryptedApiKeyResult;
    this.name = config.name;
    this.description = config.description;
    this.instructions = config.instructions || defaultInstructions;
    this.llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0,
      openAIApiKey: apiKey,
    });
  }

  async run(
    params: SentimentToolParams,
  ): Promise<Result<SentimentToolOutput, Error>> {
    try {
      const response = await this.llm.invoke([
        {
          role: "system",
          content: this.instructions,
        },
        {
          role: "user",
          content: params.input,
        },
      ]);
      logger.debug(`Sentiment analysis response: ${response.content}`);
      return Result.ok(String(response.content));
    } catch (error) {
      logger.error(`Sentiment analysis failed: ${error}`);
      return Result.error(new Error(`Sentiment analysis failed: ${error}`));
    }
  }
}
