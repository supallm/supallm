import { Result } from "typescript-result";
import { z } from "zod";
import { SDKNotifierConfig, Tool, ToolOptions } from "./tool.interface";

const defaultName = "sdk_notifier";
const defaultDescription =
  "Use this tool to send notifications or insights to the SDK. This allows real-time communication with the user interface.";

export class SDKNotifierTool implements Tool<"sdk_notifier"> {
  readonly type = "sdk_notifier";
  private outputField: string;
  private options: ToolOptions;

  readonly name: string;
  readonly description: string;
  readonly schema: z.ZodSchema;

  constructor(config: SDKNotifierConfig, options: ToolOptions) {
    this.name = config.name || defaultName;
    this.description = config.description || defaultDescription;
    this.schema = config.schema;
    this.outputField = config.output_field;
    this.options = options;
  }

  async run(
    params: z.infer<typeof this.schema>,
  ): Promise<Result<string, Error>> {
    try {
      if (!this.options.onNodeResult) {
        return Result.ok("No emiter provided for SDKNotifierTool");
      }

      await this.options.onNodeResult(
        this.options.nodeId,
        this.outputField,
        params,
        "any",
      );
      return Result.ok(`Successfully sent notification to SDK`);
    } catch (error) {
      return Result.error(
        new Error(`Failed to send SDK notification: ${error}`),
      );
    }
  }
}
