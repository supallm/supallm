import { SelectCredentials } from "@/components/select-credentials";
import { SelectModel } from "@/components/select-model";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Position } from "@xyflow/react";
import { FC, memo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProviderLogo } from "../../../logos/provider-logo";
import { Input } from "../../../ui/input";
import { LabeledHandle } from "../../labeled-handle";
import BaseNode from "../common/base-node";
import { BaseNodeContent } from "../common/base-node-content";
import { ConfigureModelMessagesDialog } from "../model-messages/configure-model-messages-dialog";
import { Message } from "../model-messages/model-message-form";

export type ModelFlowNodeData = {
  type: "model";
  model: string;
};

const OpenAIChatCompletionNode: FC<{ data: ModelFlowNodeData }> = ({
  data,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "You are a helpful assistant. Answer in a friendly manner.",
    },
  ]);
  const formSchema = z.object({
    credentialId: z.string().min(2),
    model: z.string().min(2),
    temperature: z.number().min(0).max(2),
    maxCompletionTokens: z.number().min(100).nullable(),
    systemMessage: z.string().min(0),
    initialMessages: z.array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.object({
          type: z.enum(["text", "image_url", "audio_url"]),
          text: z.string().min(2),
        }),
      }),
    ),
    allowImageUpload: z.boolean(),
    imageResolution: z.enum(["low", "high", "auto"]),
    responseFormat: z.object({
      type: z.enum(["text", "json_object"]),
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: "",
      model: "",
      temperature: 1,
      maxCompletionTokens: null,
      initialMessages: [],
      allowImageUpload: false,
      imageResolution: "auto",
      responseFormat: {
        type: "text",
      },
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("onSubmit");
    console.log(values);
  }

  return (
    <BaseNode
      outputLabel="Chat response"
      header={
        <>
          <ProviderLogo name="openai" />
          <span className="font-medium text-sm">Chat OpenAI</span>
        </>
      }
    >
      <LabeledHandle
        title="Input"
        type="source"
        id="input"
        position={Position.Left}
      />

      <BaseNodeContent>
        <div className="flex flex-col gap-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="credentialId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credentials</FormLabel>
                    <SelectCredentials
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      providerType={"openai"}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <SelectModel
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      providerType={"openai"}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature</FormLabel>
                    <FormControl>
                      <Input
                        step={0.1}
                        type="number"
                        placeholder="1"
                        {...field}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxCompletionTokens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max completion tokens</FormLabel>
                    <FormControl>
                      <Input
                        step={100}
                        type="number"
                        placeholder="25000"
                        {...field}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="messages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Messages</FormLabel>
                    <FormControl>
                      <ConfigureModelMessagesDialog initialMessages={messages}>
                        <Button variant="outline" size="xs" type="button">
                          Configure messages
                        </Button>
                      </ConfigureModelMessagesDialog>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
};

export default memo(OpenAIChatCompletionNode);
