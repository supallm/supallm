import { E2B } from "@/components/logos/e2b";
import { SelectCredentials } from "@/components/select-credentials";
import {
  Form,
  FormControl,
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
import BaseNode from "../../common/base-node";
import { BaseNodeContent } from "../../common/base-node-content";

type NodeData = {
  credentials: string;
};

type CustomNodeProps = NodeProps & {
  data: NodeData;
};

const E2BCodeInterpreterToolNode: FC<CustomNodeProps> = ({
  data,
  id: nodeId,
}) => {
  const { updateNodeData } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const formSchema = z.object({
    credentials: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      credentials: data.credentials ?? "",
    },
  });

  form.watch(() => {
    const formValues = form.getValues();

    const data: NodeData = {
      credentials: formValues.credentials,
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
      inputHandles={[]}
      header={
        <>
          <E2B width={30} height={30} />
          <span className="font-medium text-sm">E2B Code Interpreter</span>
        </>
      }
    >
      <BaseNodeContent>
        <div className="flex flex-col gap-2">
          <Form {...form}>
            <form className="space-y-4">
              <FormItem>
                <FormLabel>Credentials</FormLabel>
                <FormControl>
                  <SelectCredentials
                    providerType="e2b"
                    onValueChange={(value) => {
                      form.setValue("credentials", value);
                    }}
                    defaultValue={""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </form>
          </Form>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
};

export default memo(E2BCodeInterpreterToolNode);
