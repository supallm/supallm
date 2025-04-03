import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormSubLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateHandleId } from "@/lib/handles";
import { zodResolver } from "@hookform/resolvers/zod";
import { NodeProps, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { MessageCircle } from "lucide-react";
import { FC, memo, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BaseNode from "../../common/base-node";
import { BaseNodeContent } from "../../common/base-node-content";

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
    outputFieldName: z.string(),
    outputDescription: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      outputFieldName: data?.outputFieldName ?? "",
      outputDescription: data?.outputDescription ?? "",
    },
  });

  form.watch(() => {
    const formValues = form.getValues();

    const data: NodeData = {
      outputFieldName: formValues.outputFieldName,
      outputDescription: formValues.outputDescription,
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
          <MessageCircle className="w-4 h-4" />
          <span className="font-medium text-sm">SDK Notifier tool</span>
        </>
      }
    >
      <BaseNodeContent>
        <div className="flex flex-col gap-2">
          <Form {...form}>
            <form className="space-y-4">
              <FormItem>
                <FormLabel>Output field name</FormLabel>
                <FormControl>
                  <Input
                    {...form.register("outputFieldName")}
                    placeholder="e.g. status"
                  />
                </FormControl>
                <FormSubLabel>
                  This is the field name that you will have to watch in the SDK.
                </FormSubLabel>
                <FormMessage />
              </FormItem>
              <FormItem>
                <FormLabel>Output description</FormLabel>
                <FormControl>
                  <Textarea
                    {...form.register("outputDescription")}
                    placeholder="e.g. Return your current status between: thinking, running, completed, failed"
                    className="h-30"
                  />
                </FormControl>
                <FormSubLabel>
                  This is the instructions we will provide to the Agent to
                  format the value of the field.
                </FormSubLabel>
                <FormMessage />
              </FormItem>
            </form>
          </Form>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
};

export default memo(AgentToolNode);
