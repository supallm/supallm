import { SelectCredentials } from "@/components/select-credentials";
import { SelectModel } from "@/components/select-model";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { OpenAIModels } from "@/core/entities/flow/flow-openai";
import { generateHandleId } from "@/lib/handles";
import { zodResolver } from "@hookform/resolvers/zod";
import { NodeProps, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { FC, memo, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProviderLogo } from "../../../../logos/provider-logo";
import BaseNode from "../../common/base-node";
import { BaseNodeContent } from "../../common/base-node-content";

type OpenAIModelNodeData = {
  credentialId: string;
  model: "gpt-4o" | "gpt-4o-mini";
  temperature: number;
};

type OpenAIModelNodeProps = NodeProps & {
  data: OpenAIModelNodeData;
};

const OpenAIChatCompletionNode: FC<OpenAIModelNodeProps> = ({
  data,
  id: nodeId,
}) => {
  const { updateNodeData } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const formSchema = z.object({
    credentialId: z.string().min(2),
    model: z.enum(OpenAIModels),
    advancedSettings: z.object({
      temperature: z.number().nullable(),
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      credentialId: data.credentialId ?? "",
      model: data.model ?? "",
      advancedSettings: {
        temperature: data.temperature ?? null,
      },
    },
  });

  form.watch(() => {
    const formValues = form.getValues();

    const data: OpenAIModelNodeData = {
      credentialId: formValues.credentialId,
      model: formValues.model,
      temperature: formValues.advancedSettings.temperature ?? 1,
    };
    updateNodeData(nodeId, data);
  });

  const outputHandles = useMemo(() => {
    return [
      {
        label: "AI Agent",
        id: generateHandleId("ai-model", "ai-agent"),
        type: "ai-model",
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
      outputLabel="Connect"
      header={
        <>
          <ProviderLogo name="openai" />
          <span className="font-medium text-sm">Model OpenAI</span>
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
            </form>
          </Form>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
};

export default memo(OpenAIChatCompletionNode);
