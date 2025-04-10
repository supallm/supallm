import { Result } from "typescript-result";
import { z } from "zod";
import { NodeOptions } from "../nodes/types";
import { logger } from "../utils/logger";
import { SDKNotifier, Tool } from "./tool.interface";

const defaultName = "sdk-notifier-tool";
const defaultDescription =
  "Use this tool to send notifications or insights to the SDK. This allows real-time communication with the user interface.";

export class SDKNotifierTool implements Tool<"sdk-notifier-tool"> {
  readonly type = "sdk-notifier-tool";
  readonly id: string;
  private outputField: string;

  readonly name: string;
  readonly description: string;
  readonly schema: z.ZodSchema;

  constructor(defintion: SDKNotifier) {
    this.id = defintion.id;
    this.name = defintion.name || defaultName;
    this.description = defintion.description || defaultDescription;
    this.schema = z.object({
      input: z.any().describe(defintion.config.outputDescription),
    });
    this.outputField = defintion.config.outputFieldName;
  }

  async run(
    params: z.infer<typeof this.schema>,
    options: NodeOptions,
  ): Promise<Result<string, Error>> {
    try {
      logger.debug(
        `running ${this.name} SDKNotifierTool: ${JSON.stringify(params)}`,
      );

      options.onEvent("TOOL_STARTED", {
        toolName: this.name,
        inputs: params,
        agentName: "default",
        nodeId: this.id,
      });

      await options.onEvent("AGENT_NOTIFICATION", {
        nodeId: this.id,
        outputField: this.outputField,
        data: params.input,
        ioType: "any",
      });

      options.onEvent("TOOL_COMPLETED", {
        agentName: "default",
        nodeId: this.id,
        toolName: this.name,
        inputs: params,
        output: {
          status: "success",
          message: "Successfully sent notification to SDK",
        },
      });

      return Result.ok(
        JSON.stringify({
          status: "success",
          message: "Successfully sent notification to SDK",
        }),
      );
    } catch (error) {
      options.onEvent("TOOL_FAILED", {
        agentName: "default",
        nodeId: this.id,
        toolName: this.name,
        error: error as string,
      });
      return Result.error(
        new Error(`Failed to send SDK notification: ${error}`),
      );
    }
  }
}
