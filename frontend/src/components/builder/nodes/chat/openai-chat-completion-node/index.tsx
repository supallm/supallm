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
  ChatOpenAINodeData,
  OpenAIModels,
} from "@/core/entities/flow/flow-openai";
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
import { OpenAIChatAdvancedSettingsDialog } from "./advanced-settings-dialog";

type OpenAIChatCompletionNodeProps = NodeProps & {
  data: ChatOpenAINodeData;
};

const OpenAIChatCompletionNode: FC<OpenAIChatCompletionNodeProps> = ({
  data,
  id: nodeId,
}) => {
  const { updateNodeData } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const formSchema = z.object({
    credentialId: z.string().min(2),
    model: z.enum(OpenAIModels),
    outputMode: z.enum(["text", "text-stream"]),
    advancedSettings: z.object({
      temperature: z.number().nullable(),
      maxCompletionTokens: z.number().nullable(),
      developerMessage: z.string(),
      imageResolution: z.enum(["low", "high", "auto"]),
      responseFormat: z.object({
        type: z.enum(["text", "json_object"]),
      }),
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
        maxCompletionTokens: data.maxCompletionTokens ?? null,
        developerMessage: data.developerMessage ?? "",
        imageResolution: data.imageResolution ?? "auto",
        responseFormat: data.responseFormat ?? {
          type: "text",
        },
      },
    },
  });

  form.watch(() => {
    const formValues = form.getValues();

    const data: ChatOpenAINodeData = {
      credentialId: formValues.credentialId,
      providerType: "openai",
      model: formValues.model,
      outputMode: formValues.outputMode,
      temperature: formValues.advancedSettings.temperature,
      maxCompletionTokens: formValues.advancedSettings.maxCompletionTokens,
      developerMessage: formValues.advancedSettings.developerMessage,
      imageResolution: formValues.advancedSettings.imageResolution,
      responseFormat: formValues.advancedSettings.responseFormat,
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
          <ProviderLogo name="openai" />
          <span className="font-medium text-sm">OpenAI Chat Completion</span>
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
                  <OpenAIChatAdvancedSettingsDialog
                    data={field.value}
                    onChange={(values) => {
                      field.onChange(values);
                    }}
                  >
                    <Button variant="outline" size="xs" type="button">
                      Advanced settings
                    </Button>
                  </OpenAIChatAdvancedSettingsDialog>
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
