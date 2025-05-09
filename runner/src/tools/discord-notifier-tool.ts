import { Result } from "typescript-result";
import { z } from "zod";
import { NodeOptions } from "../nodes/types";
import { logger } from "../utils/logger";
import { Discord, Tool, ToolOutput } from "./tool.interface";

const defaultDescription =
  "Send notifications to Discord using webhooks. You can send simple messages or rich embeds.";
const defaultName = "discord_notifier";

export class DiscordNotifierTool implements Tool<"discord_notifier"> {
  readonly type = "discord_notifier";
  readonly id: string;
  readonly name: string;
  readonly description: string;
  private webhookUrl: string;

  readonly schema = z.object({
    content: z.string().optional().describe("Simple text message content"),
    username: z.string().optional().describe("Override the webhook's username"),
    avatar_url: z.string().optional().describe("Override the webhook's avatar"),
    embeds: z
      .array(
        z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          color: z.number().optional(),
          author: z
            .object({
              name: z.string(),
              url: z.string().optional(),
              icon_url: z.string().optional(),
            })
            .optional(),
          fields: z
            .array(
              z.object({
                name: z.string(),
                value: z.string(),
                inline: z.boolean().optional(),
              }),
            )
            .optional(),
          footer: z
            .object({
              text: z.string(),
              icon_url: z.string().optional(),
            })
            .optional(),
        }),
      )
      .optional(),
  });

  constructor(definition: Discord) {
    this.id = definition.id;
    this.name = definition.name || defaultName;
    this.description = definition.description || defaultDescription;
    this.webhookUrl = definition.config.webhookUrl;
  }

  async run(
    params: z.infer<typeof this.schema>,
    options: NodeOptions,
  ): Promise<Result<ToolOutput, Error>> {
    try {
      logger.debug(
        `running ${this.name} DiscordNotifierTool: ${JSON.stringify(params)}`,
      );

      options.onEvent("TOOL_STARTED", {
        toolName: this.name,
        inputs: params,
        agentName: "default",
        nodeId: this.id,
      });

      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.statusText}`);
      }

      options.onEvent("TOOL_COMPLETED", {
        agentName: "default",
        nodeId: this.id,
        toolName: this.name,
        inputs: params,
        output: {
          status: "success",
          message: "Message sent successfully to Discord",
        },
      });

      return Result.ok("Message sent successfully to Discord");
    } catch (error) {
      options.onEvent("TOOL_FAILED", {
        agentName: "default",
        nodeId: this.id,
        toolName: this.name,
        error: error as string,
      });
      return Result.error(
        new Error(`Failed to send Discord notification: ${error}`),
      );
    }
  }
}
