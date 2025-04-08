import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { generateHandleId } from "@/lib/handles";
import { zodResolver } from "@hookform/resolvers/zod";
import { NodeProps, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { MessageCircle } from "lucide-react";
import { FC, memo, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BaseNode from "../../common/base-node";
import { BaseNodeContent } from "../../common/base-node-content";
import { SDKNotifierToolAdvancedSettingsDialog } from "./advanced-settings-dialog";

type NodeData = {
  outputFieldName: string;
  outputDescription: string;
};

type CustomNodeProps = NodeProps & {
  data: NodeData;
};

const AgentToolNode: FC<CustomNodeProps> = ({ data, id: nodeId }) => {
  const { updateNodeData } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const formSchema = z.object({
    settings: z.object({
      outputFieldName: z.string(),
      outputDescription: z.string(),
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      settings: {
        outputFieldName: data?.outputFieldName ?? "",
        outputDescription: data?.outputDescription ?? "",
      },
    },
  });

  form.watch(() => {
    const formValues = form.getValues();

    const data: NodeData = {
      outputFieldName: formValues.settings.outputFieldName,
      outputDescription: formValues.settings.outputDescription,
    };
    updateNodeData(nodeId, data);
  });

  const outputHandles = useMemo(() => {
    return [
      {
        label: "AI Agent",
        id: generateHandleId("tools", "ai-agent"),
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
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium text-sm">SDK Notifier tool</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {data.outputFieldName}
          </div>
        </div>
      }
    >
      <BaseNodeContent>
        <div className="flex flex-col gap-2">
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="settings"
                render={({ field }) => (
                  <SDKNotifierToolAdvancedSettingsDialog
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
                  </SDKNotifierToolAdvancedSettingsDialog>
                )}
              />
            </form>
          </Form>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
};

export default memo(AgentToolNode);
