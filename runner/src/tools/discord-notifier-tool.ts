import { Result } from "typescript-result";
import { z } from "zod";
import {
  DiscordNotifierToolOutput,
  DiscordNotifierToolParams,
  Tool,
  ToolConfig,
  ToolType,
} from "./tool.interface";

const defaultDescription =
  "Send notifications to Discord using webhooks. You can send simple messages or rich embeds.";
const defaultName = "discord_notifier";

export class DiscordNotifierTool implements Tool<DiscordNotifierToolOutput> {
  type: ToolType = "discord_notifier";
  name: string;
  description: string;

  schema = z.object({
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

  constructor(private config: ToolConfig) {
    this.name = config.name || defaultName;
    this.description = config.description || defaultDescription;
  }

  async run(
    params: DiscordNotifierToolParams,
  ): Promise<Result<DiscordNotifierToolOutput, Error>> {
    try {
      const response = await fetch(this.config["webhookUrl"], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.statusText}`);
      }

      return Result.ok("Message sent successfully to Discord");
    } catch (error) {
      return Result.error(
        new Error(`Failed to send Discord notification: ${error}`),
      );
    }
  }
}
