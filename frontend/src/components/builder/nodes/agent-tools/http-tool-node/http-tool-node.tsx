import { Button } from "@/components/ui/button";
import { generateHandleId } from "@/lib/handles";
import { zodResolver } from "@hookform/resolvers/zod";
import { NodeProps, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { NetworkIcon } from "lucide-react";
import { FC, memo, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BaseNode from "../../common/base-node";
import { BaseNodeContent } from "../../common/base-node-content";
import { HttpToolAdvancedSettingsDialog } from "./advanced-settings-dialog";

export type HttpToolNodeData = {
  headers: {
    key: string;
    value: string;
  }[];
};

type CustomNodeProps = NodeProps & {
  data: HttpToolNodeData;
};

const HttpToolNode: FC<CustomNodeProps> = ({ data, id: nodeId }) => {
  const { updateNodeData } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const formSchema = z.object({
    headers: z
      .object({
        key: z.string(),
        value: z.string(),
      })
      .array(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      headers: data.headers ?? [],
    },
  });

  form.watch(() => {
    const formValues = form.getValues();

    const data: HttpToolNodeData = {
      headers: formValues.headers,
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
        <>
          <NetworkIcon className="w-4 h-4" />
          <span className="font-medium text-sm">HTTP Client tool</span>
        </>
      }
    >
      <BaseNodeContent>
        <div className="flex flex-col gap-2">
          <HttpToolAdvancedSettingsDialog
            headers={data.headers}
            onChange={(values) => {
              form.setValue("headers", values);
            }}
          >
            <Button variant="outline" size="xs" type="button">
              Advanced settings
            </Button>
          </HttpToolAdvancedSettingsDialog>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
};

export default memo(HttpToolNode);
