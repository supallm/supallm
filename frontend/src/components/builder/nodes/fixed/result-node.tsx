import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ResultHandle, ResultNodeData } from "@/core/entities/flow/flow-result";
import { generateHandleId } from "@/lib/handles";
import { zodResolver } from "@hookform/resolvers/zod";
import { NodeProps, useUpdateNodeInternals } from "@xyflow/react";
import { FolderSymlink, XIcon } from "lucide-react";
import { FC, memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BaseNode from "../common/base-node";
import { NewHandleInput } from "./new-handle-input";

type ResultNodeProps = NodeProps & { data: ResultNodeData };

const ResultNode: FC<ResultNodeProps> = ({ data, id: nodeId }) => {
  const updateNodeInternals = useUpdateNodeInternals();

  const formSchema = z.object({
    handles: z.array(
      z.object({
        type: z.enum(["text", "image"]),
        id: z.string(),
        label: z.string(),
      }),
    ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      handles: [
        {
          type: "text",
          id: generateHandleId("text", "result"),
          label: "result",
        },
      ],
    },
  });

  const formHandles = form.watch("handles");

  const onHandleChange = (handle: ResultHandle) => {
    const index = formHandles.findIndex((h) => h.id === handle.id);
    if (index === -1) {
      form.setValue("handles", [...formHandles, handle]);
    } else {
      form.setValue("handles", [...formHandles.slice(0, index), handle]);
    }
  };

  const removeHandle = (id: string) => {
    form.setValue(
      "handles",
      formHandles.filter((handle) => handle.id !== id),
    );
  };

  useEffect(() => {
    /**
     * See:
     * https://reactflow.dev/api-reference/hooks/use-update-node-internals
     */
    updateNodeInternals(nodeId);
  }, [nodeId, formHandles, updateNodeInternals]);

  return (
    <BaseNode
      outputHandles={[]}
      inputHandles={formHandles}
      header={
        <>
          <FolderSymlink className="w-4 h-4" />
          <span className="font-medium text-sm">Final result</span>
        </>
      }
    >
      <div>
        <Form {...form}>
          <NewHandleInput onChange={onHandleChange} />
        </Form>

        <div className="flex flex-col gap-1 mt-2">
          {formHandles.map((handle) => (
            <div key={handle.id}>
              <Button
                variant="outline"
                size="xs"
                endContent={<XIcon />}
                onClick={() => removeHandle(handle.id)}
              >
                {handle.label}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </BaseNode>
  );
};

export default memo(ResultNode);
