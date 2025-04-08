import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import {
  ChatOpenAIAsToolNodeData,
  OpenAIModels,
} from "@/core/entities/flow/flow-chat-openai-as-tool";
import { generateHandleId } from "@/lib/handles";
import { zodResolver } from "@hookform/resolvers/zod";
import { NodeProps, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { FC, memo, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProviderLogo } from "../../../../logos/provider-logo";
import BaseNode from "../../common/base-node";
import { BaseNodeContent } from "../../common/base-node-content";
import { OpenAIChatAdvancedSettingsDialog } from "./advanced-settings-dialog";

type ChatOpenAIAsToolNodeProps = NodeProps & {
  data: ChatOpenAIAsToolNodeData;
};

const ChatOpenAIAsToolNode: FC<ChatOpenAIAsToolNodeProps> = ({
  data,
  id: nodeId,
}) => {
  const { updateNodeData } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const formSchema = z.object({
    advancedSettings: z.object({
      credentialId: z.string().min(2),
      model: z.enum(OpenAIModels),
      outputMode: z.enum(["text", "text-stream"]),
      description: z.string(),
      name: z.string().regex(/^[a-zA-Z0-9_-]+$/),
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
      advancedSettings: {
        credentialId: data.credentialId ?? "",
        model: data.model ?? "",
        description: data.description ?? "",
        name: data.name ?? "",
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

    const data: ChatOpenAIAsToolNodeData = {
      name: formValues.advancedSettings.name,
      description: formValues.advancedSettings.description,
      credentialId: formValues.advancedSettings.credentialId,
      providerType: "openai",
      model: formValues.advancedSettings.model,
      temperature: formValues.advancedSettings.temperature,
      maxCompletionTokens: formValues.advancedSettings.maxCompletionTokens,
      developerMessage: formValues.advancedSettings.developerMessage,
      imageResolution: formValues.advancedSettings.imageResolution,
      responseFormat: formValues.advancedSettings.responseFormat,
    };
    updateNodeData(nodeId, data);
  });

  const outputHandles = useMemo(() => {
    return [
      {
        label: "AI Agent",
        id: generateHandleId("tools", "connection"),
        type: "tools",
      } as const,
    ];
  }, []);

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
      inputHandles={[]}
      header={
        <div className="">
          <div className="flex items-center gap-2">
            <ProviderLogo name="openai" />
            <span className="font-medium text-sm">OpenAI LLM as tool</span>
          </div>
          <div className="text-sm text-muted-foreground">{data.name}</div>
        </div>
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
                name="advancedSettings"
                render={({ field }) => (
                  <OpenAIChatAdvancedSettingsDialog
                    data={field.value}
                    onChange={(values) => {
                      field.onChange(values);
                    }}
                  >
                    <Button
                      variant="outline"
                      size="xs"
                      type="button"
                      className="w-full"
                    >
                      Configure
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

export default memo(ChatOpenAIAsToolNode);
