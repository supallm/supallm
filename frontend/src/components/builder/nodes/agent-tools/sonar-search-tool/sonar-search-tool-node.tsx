import { SelectCredentials } from "@/components/select-credentials";
import { SelectModel } from "@/components/select-model";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { generateHandleId } from "@/lib/handles";
import { zodResolver } from "@hookform/resolvers/zod";
import { NodeProps, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { FC, memo, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProviderLogo } from "../../../../logos/provider-logo";
import BaseNode from "../../common/base-node";
import { BaseNodeContent } from "../../common/base-node-content";
import { SonarAdvancedSettingsDialog } from "./advanced-settings-dialog";

export interface NodeData {
  credentialId: string;
  model: string;
  temperature: number | null;
  maxTokens: number | null;
  searchDomainFilter: string[] | null;
  searchRecencyFilter: string | null;
  returnRelatedQuestions: boolean | null;
}

type CustomNodeProps = NodeProps & {
  data: NodeData;
};

const SonarToolNode: FC<CustomNodeProps> = ({ data, id: nodeId }) => {
  const { updateNodeData } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const formSchema = z.object({
    credentialId: z.string().min(2),
    model: z.string().min(1),
    advancedSettings: z.object({
      temperature: z.number().nullable(),
      maxTokens: z.number().nullable(),
      searchDomainFilter: z.array(z.string()).nullable(),
      searchRecencyFilter: z.string().nullable(),
      returnRelatedQuestions: z.boolean().nullable(),
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      credentialId: data?.credentialId ?? "",
      model: data?.model ?? "",
      advancedSettings: {
        temperature: data?.temperature ?? null,
        maxTokens: data?.maxTokens ?? null,
        searchDomainFilter: data?.searchDomainFilter ?? null,
        searchRecencyFilter: data?.searchRecencyFilter ?? null,
        returnRelatedQuestions: data?.returnRelatedQuestions ?? null,
      },
    },
  });

  form.watch(() => {
    const formValues = form.getValues();

    updateNodeData(nodeId, {
      credentialId: formValues.credentialId,
      model: formValues.model,
      temperature: formValues.advancedSettings.temperature,
      maxTokens: formValues.advancedSettings.maxTokens,
      searchDomainFilter: formValues.advancedSettings.searchDomainFilter,
      searchRecencyFilter: formValues.advancedSettings.searchRecencyFilter,
      returnRelatedQuestions:
        formValues.advancedSettings.returnRelatedQuestions,
    });
  });

  const outputHandles = useMemo(() => {
    return [
      {
        label: "AI Agent",
        id: generateHandleId("tools", "AI Agent"),
        type: "tools",
      } as const,
    ];
  }, []);

  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [nodeId, outputHandles, updateNodeInternals]);

  return (
    <BaseNode
      nodeId={nodeId}
      outputHandles={outputHandles}
      inputHandles={[]}
      header={
        <>
          <ProviderLogo name="perplexity" width={24} height={24} />
          <span className="font-medium text-sm">Sonar by Perplexity</span>
        </>
      }
    >
      <BaseNodeContent>
        <div className="flex flex-col gap-2">
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="credentialId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credentials</FormLabel>
                    <SelectCredentials
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      providerType="perplexity"
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
                      providerType="perplexity"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="advancedSettings"
                render={({ field }) => (
                  <SonarAdvancedSettingsDialog
                    data={field.value}
                    onChange={(values: typeof field.value) => {
                      field.onChange(values);
                    }}
                  >
                    <Button variant="outline" size="xs" type="button">
                      Advanced settings
                    </Button>
                  </SonarAdvancedSettingsDialog>
                )}
              />
            </form>
          </Form>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
};

export default memo(SonarToolNode);
