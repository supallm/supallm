import { Result } from "typescript-result";
import { z } from "zod";
import { NodeOptions } from "../nodes/types";
import { logger } from "../utils/logger";
import { Http, Tool, ToolOutput } from "./tool.interface";

const defaultDescription =
  "Execute HTTP requests. You can send GET, POST, PUT, DELETE, PATCH, etc. requests to any URL.";
const defaultName = "http";

export class HttpTool implements Tool<"http_request"> {
  readonly type = "http_request";
  readonly id: string;
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

  constructor(definition: Http) {
    this.id = definition.id;
    this.name = definition.name || defaultName;
    this.description = definition.description || defaultDescription;
    this.url = definition.config.url;
    this.headers = definition.config.headers;

    if (!this.url) {
      throw new Error("URL is required");
    }
  }

  async run(
    params: z.infer<typeof this.schema>,
    options: NodeOptions,
  ): Promise<Result<ToolOutput, Error>> {
    try {
      logger.debug(`running ${this.name} HttpTool: ${JSON.stringify(params)}`);

      options.onEvent("TOOL_STARTED", {
        toolName: this.name,
        inputs: params,
        agentName: "default",
        nodeId: this.id,
      });

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

      options.onEvent("TOOL_COMPLETED", {
        agentName: "default",
        nodeId: this.id,
        toolName: this.name,
        inputs: params,
        output: {
          status: response.status,
          body: await response.text(),
        },
      });

      return Result.ok(await response.text());
    } catch (error) {
      options.onEvent("TOOL_FAILED", {
        agentName: "default",
        nodeId: this.id,
        toolName: this.name,
        error: error as string,
      });
      return Result.error(new Error(`Failed to send HTTP request: ${error}`));
    }
  }
}
