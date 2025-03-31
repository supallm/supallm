import { Result } from "typescript-result";
import { z } from "zod";
import {
  HttpToolOutput,
  HttpToolParams,
  Tool,
  ToolConfig,
  ToolType,
} from "./tool.interface";

const defaultDescription =
  "Execute HTTP requests. You can send GET, POST, PUT, DELETE, PATCH, etc. requests to any URL.";
const defaultName = "http";

export class HttpTool implements Tool<HttpToolOutput> {
  type: ToolType = "http_request";
  private url: string;

  name: string;
  description: string;

  schema = z.object({
    url: z.string().describe("The URL to send the request to"),
    method: z
      .enum(["GET", "POST", "PUT", "DELETE", "PATCH"])
      .describe("The HTTP method to use"),
    headers: z
      .record(z.string(), z.string())
      .optional()
      .describe("Additional headers to send with the request"),
    body: z.string().optional().describe("The body of the request"),
  });

  constructor(config: ToolConfig) {
    this.name = config.name || defaultName;
    this.description = config.description || defaultDescription;
    this.url = config["url"];
    if (!this.url) {
      throw new Error("URL is required");
    }
  }

  async run(params: HttpToolParams): Promise<Result<HttpToolOutput, Error>> {
    try {
      const response = await fetch(this.url, {
        method: params.method,
        headers: {
          "Content-Type": "application/json",
          ...params.headers,
        },
        body: params.body,
      });

      if (!response.ok) {
        throw new Error(`HTTP request failed: ${response.statusText}`);
      }

      return Result.ok(await response.text());
    } catch (error) {
      return Result.error(new Error(`Failed to send HTTP request: ${error}`));
    }
  }
}
