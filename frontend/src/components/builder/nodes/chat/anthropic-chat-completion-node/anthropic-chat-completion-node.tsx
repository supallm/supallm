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
import {
  AnthropicModels,
  ChatAnthropicNodeData,
} from "@/core/entities/flow/flow-anthropic";
import { generateHandleId } from "@/lib/handles";
import { assertUnreachable } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { NodeProps, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { FC, memo, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProviderLogo } from "../../../../logos/provider-logo";
import BaseNode from "../../common/base-node";
import { BaseNodeContent } from "../../common/base-node-content";
import { AnthropicChatAdvancedSettingsDialog } from "./advanced-settings-dialog";

type AnthropicChatCompletionNodeProps = NodeProps & {
  data: ChatAnthropicNodeData;
};

const AnthropicChatCompletionNode: FC<AnthropicChatCompletionNodeProps> = ({
  data,
  id: nodeId,
}) => {
  const { updateNodeData } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const formSchema = z.object({
    credentialId: z.string().min(2),
    model: z.enum(AnthropicModels),
    outputMode: z.enum(["text", "text-stream"]),
    advancedSettings: z.object({
      temperature: z.number().nullable(),
      maxTokenToSample: z.number().nullable(),
      systemPrompt: z.string(),
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      credentialId: data.credentialId ?? "",
      model: data.model ?? "",
      outputMode: data.outputMode ?? "text",
      advancedSettings: {
        temperature: data.temperature ?? null,
        maxTokenToSample: data.maxTokenToSample ?? null,
        systemPrompt: data.systemPrompt ?? "",
      },
    },
  });

  form.watch(() => {
    const formValues = form.getValues();

    const data: ChatAnthropicNodeData = {
      credentialId: formValues.credentialId,
      providerType: "anthropic",
      model: formValues.model,
      outputMode: formValues.outputMode,
      temperature: formValues.advancedSettings.temperature,
      maxTokenToSample: formValues.advancedSettings.maxTokenToSample,
      systemPrompt: formValues.advancedSettings.systemPrompt,
    };
    updateNodeData(nodeId, data);
  });

  const outputMode = form.watch("outputMode");

  const outputHandles = useMemo(() => {
    switch (outputMode) {
      case "text":
        return [
          {
            label: "Response",
            id: generateHandleId("text", "response"),
            type: "text",
          } as const,
        ];
      case "text-stream":
        return [
          {
            label: "Response stream",
            id: generateHandleId("text", "response"),
            type: "text",
          } as const,
        ];
      default:
        assertUnreachable(outputMode);
        return [];
    }
  }, [outputMode]);

  useEffect(() => {
    /**
     * See:
     * https://reactflow.dev/api-reference/hooks/use-update-node-internals
     */
    updateNodeInternals(nodeId);
  }, [nodeId, outputHandles, updateNodeInternals]);

  return (
    <BaseNode
      nodeId={nodeId}
      outputHandles={outputHandles}
      inputHandles={[
        {
          label: "Prompt",
          id: generateHandleId("text", "prompt"),
          type: "text",
        },
      ]}
      header={
        <>
          <ProviderLogo name="anthropic" />
          <span className="font-medium text-sm">Anthropic Chat Completion</span>
        </>
      }
    >
      <BaseNodeContent>
        <div className="flex flex-col gap-2">
          <Form {...form}>
            <form
              // onChange={form.handleSubmit(onSubmit, onInvalid)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="credentialId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credentials</FormLabel>
                    <SelectCredentials
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      providerType={"anthropic"}
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
                      providerType={"anthropic"}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="outputMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Output mode</FormLabel>
                    <FormControl>
                      <AppSelect
                        placeholder="Select output mode"
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        defaultValue={field.value}
                        choices={[
                          {
                            value: "text",
                            label: "Normal",
                          },
                          {
                            value: "text-stream",
                            label: "Stream",
                          },
                        ]}
                      ></AppSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="advancedSettings"
                render={({ field }) => (
                  <AnthropicChatAdvancedSettingsDialog
                    data={field.value}
                    onChange={(values) => {
                      field.onChange(values);
                    }}
                  >
                    <Button variant="outline" size="xs" type="button">
                      Advanced settings
                    </Button>
                  </AnthropicChatAdvancedSettingsDialog>
                )}
              />
            </form>
          </Form>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
};

export default memo(AnthropicChatCompletionNode);
