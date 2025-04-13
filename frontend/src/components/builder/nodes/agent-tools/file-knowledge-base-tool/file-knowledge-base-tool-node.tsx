import { Button } from "@/components/ui/button";
import { Form, FormItem, FormMessage } from "@/components/ui/form";
import { generateHandleId } from "@/lib/handles";
import { zodResolver } from "@hookform/resolvers/zod";
import { NodeProps, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { Files } from "lucide-react";
import { FC, memo, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BaseNode from "../../common/base-node";
import { BaseNodeContent } from "../../common/base-node-content";
import { BaseNodeHeader } from "../../common/base-node-header";

type NodeData = {
  credentialId: string;
};

type CustomNodeProps = NodeProps & {
  data: NodeData;
};

const FileKnowledgeBaseToolNode: FC<CustomNodeProps> = ({
  data,
  id: nodeId,
}) => {
  const { updateNodeData } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const formSchema = z.object({
    credentialId: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      credentialId: data.credentialId ?? "",
    },
  });

  form.watch(() => {
    const formValues = form.getValues();

    const data: NodeData = {
      credentialId: formValues.credentialId,
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
    updateNodeInternals(nodeId);
  }, [nodeId, outputHandles, updateNodeInternals]);

  return (
    <BaseNode
      nodeId={nodeId}
      outputHandles={outputHandles}
      inputHandles={[
        {
          label: "Embedding model",
          id: generateHandleId("ai-model", "embedding-model"),
          type: "ai-model",
        },
      ]}
      header={
        <BaseNodeHeader
          title="Knowledge Base"
          logo={<Files width={20} height={20} />}
        />
      }
    >
      <BaseNodeContent>
        <div className="flex flex-col gap-2">
          <Form {...form}>
            <form className="space-y-4">
              <FormItem>
                <Button variant="outline" size="sm" type="button">
                  Configure
                </Button>
                <FormMessage />
              </FormItem>
            </form>
          </Form>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
};

export default memo(FileKnowledgeBaseToolNode);
