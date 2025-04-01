import { Result } from "typescript-result";
import { z } from "zod";
import { HttpConfig, Tool, ToolOutput } from "./tool.interface";

const defaultDescription =
  "Execute HTTP requests. You can send GET, POST, PUT, DELETE, PATCH, etc. requests to any URL.";
const defaultName = "http";

export class HttpTool implements Tool<"http_request"> {
  readonly type = "http_request";
  readonly name: string;
  readonly description: string;
  private url: string;
  private headers: Record<string, string>;

  readonly schema = z.object({
    method: z
      .enum(["GET", "POST", "PUT", "DELETE", "PATCH"])
      .describe("The HTTP method to use"),
    body: z.string().optional().describe("The body of the request"),
  });

  constructor(config: HttpConfig) {
    this.name = config.name || defaultName;
    this.description = config.description || defaultDescription;
    this.url = config.url;
    this.headers = config.headers;

    if (!this.url) {
      throw new Error("URL is required");
    }
  }

  async run(
    params: z.infer<typeof this.schema>,
  ): Promise<Result<ToolOutput, Error>> {
    try {
      const response = await fetch(this.url, {
        method: params.method,
        headers: {
          "Content-Type": "application/json",
          ...this.headers,
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
