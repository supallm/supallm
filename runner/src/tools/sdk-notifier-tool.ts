import { Result } from "typescript-result";
import { z } from "zod";
import { logger } from "../utils/logger";
import { SDKNotifier, Tool, ToolOptions } from "./tool.interface";

const defaultName = "sdk-notifier-tool";
const defaultDescription =
  "Use this tool to send notifications or insights to the SDK. This allows real-time communication with the user interface.";

export class SDKNotifierTool implements Tool<"sdk-notifier-tool"> {
  readonly type = "sdk-notifier-tool";
  readonly id: string;
  private outputField: string;
  private options: ToolOptions;

  readonly name: string;
  readonly description: string;
  readonly schema: z.ZodSchema;

  constructor(defintion: SDKNotifier, options: ToolOptions) {
    this.id = defintion.id;
    this.name = defintion.name || defaultName;
    this.description = defintion.description || defaultDescription;
    this.schema = z.object({
      input: z.any().describe(defintion.config.outputDescription),
    });
    this.outputField = defintion.config.outputFieldName;
    this.options = options;
  }

  async run(
    params: z.infer<typeof this.schema>,
  ): Promise<Result<string, Error>> {
    try {
      logger.debug(
        `running ${this.name} SDKNotifierTool: ${JSON.stringify(params)}`,
      );
      if (!this.options.nodeOptions) {
        return Result.ok("No emiter provided for SDKNotifierTool");
      }

      await this.options.nodeOptions.onEvent("AGENT_NOTIFICATION", {
        nodeId: this.options.nodeId,
        outputField: this.outputField,
        data: params.input,
        ioType: "any",
      });
      return Result.ok(`Successfully sent notification to SDK`);
    } catch (error) {
      return Result.error(
        new Error(`Failed to send SDK notification: ${error}`),
      );
    }
  }
}
