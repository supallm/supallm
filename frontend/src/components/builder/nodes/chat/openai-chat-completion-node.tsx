import { AppSelect } from "@/components/app-select";
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
import { NumberInput } from "@/components/ui/number-input";
import { ChatOpenAINodeData } from "@/core/entities/flow/flow-openai";
import { zodResolver } from "@hookform/resolvers/zod";
import { Position } from "@xyflow/react";
import { FC, memo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProviderLogo } from "../../../logos/provider-logo";
import { LabeledHandle } from "../../labeled-handle";
import BaseNode from "../common/base-node";
import { BaseNodeContent } from "../common/base-node-content";
import { ConfigureModelMessagesDialog } from "../model-messages/configure-model-messages-dialog";

const OpenAIChatCompletionNode: FC<{ data: ChatOpenAINodeData }> = ({
  data,
}) => {
  const formSchema = z.object({
    credentialId: z.string().min(2),
    model: z.string().min(2),
    temperature: z.number().min(0).max(2),
    maxCompletionTokens: z.number().min(100).optional(),
    developerMessage: z.string().min(0),
    imageResolution: z.enum(["low", "high", "auto"]),
    responseFormat: z.object({
      type: z.enum(["text", "json_object"]),
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: data.credentialId ?? "",
      model: data.model ?? "",
      temperature: data.temperature ?? 1,
      maxCompletionTokens: data.maxCompletionTokens ?? undefined,
      developerMessage: data.developerMessage ?? "",
      imageResolution: data.imageResolution ?? "auto",
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
                      <NumberInput placeholder="1" {...field} />
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
                      <NumberInput placeholder="25000" clearable {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="developerMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Developer Message</FormLabel>
                    <FormControl>
                      <ConfigureModelMessagesDialog
                        developerMessage={field.value}
                        {...field}
                      >
                        <Button variant="outline" size="xs" type="button">
                          Configure
                        </Button>
                      </ConfigureModelMessagesDialog>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="responseFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response Format</FormLabel>
                    <FormControl>
                      <AppSelect
                        onValueChange={(value) => {
                          field.onChange({ type: value });
                        }}
                        defaultValue={field.value.type}
                        choices={[
                          {
                            value: "text",
                            label: "Text",
                          },
                          {
                            value: "json_object",
                            label: "JSON",
                          },
                        ]}
                      ></AppSelect>
                    </FormControl>
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
