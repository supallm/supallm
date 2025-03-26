import { AppSelect } from "@/components/app-select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChatOllamaNodeData } from "@/core/entities/flow/flow-ollama";
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
import { OllamaChatAdvancedSettingsDialog } from "./advanced-settings-dialog";

type OllamaChatCompletionNodeProps = NodeProps & {
  data: ChatOllamaNodeData;
};

const OllamaChatCompletionNode: FC<OllamaChatCompletionNodeProps> = ({
  data,
  id: nodeId,
}) => {
  const { updateNodeData } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const formSchema = z.object({
    baseUrl: z.string().url().default("http://localhost:11434"),
    model: z.string().min(1),
    outputMode: z.enum(["text", "text-stream"]),
    advancedSettings: z.object({
      temperature: z.number().nullable(),
      systemPrompt: z.string(),
      responseFormat: z.object({
        type: z.enum(["text", "json_object"]),
      }),
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      baseUrl: data.baseUrl ?? "http://localhost:11434",
      model: data.model ?? "",
      outputMode: data.outputMode ?? "text",
      advancedSettings: {
        temperature: data.temperature ?? null,
        systemPrompt: data.systemPrompt ?? "",
        responseFormat: data.responseFormat ?? { type: "text" },
      },
    },
  });

  form.watch(() => {
    const formValues = form.getValues();

    const data: ChatOllamaNodeData = {
      baseUrl: formValues.baseUrl,
      providerType: "ollama",
      model: formValues.model,
      outputMode: formValues.outputMode,
      temperature: formValues.advancedSettings.temperature,
      systemPrompt: formValues.advancedSettings.systemPrompt,
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
          <ProviderLogo name="ollama" />
          <span className="font-medium text-sm">Ollama Chat Completion</span>
        </>
      }
    >
      <BaseNodeContent>
        <div className="flex flex-col gap-2">
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="baseUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base URL</FormLabel>
                    <Input
                      {...field}
                      placeholder="Ollama instance base URL"
                      defaultValue={field.value}
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
                    <Input
                      {...field}
                      placeholder="Enter model name"
                      defaultValue={field.value}
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
                  <OllamaChatAdvancedSettingsDialog
                    data={field.value}
                    onChange={(values) => {
                      field.onChange(values);
                    }}
                  >
                    <Button variant="outline" size="xs" type="button">
                      Advanced settings
                    </Button>
                  </OllamaChatAdvancedSettingsDialog>
                )}
              />
            </form>
          </Form>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
};

export default memo(OllamaChatCompletionNode);
