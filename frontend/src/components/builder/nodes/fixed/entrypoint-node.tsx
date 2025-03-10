import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  EntrypointHandle,
  EntrypointNodeData,
} from "@/core/entities/flow/flow-entrypoint";
import { zodResolver } from "@hookform/resolvers/zod";
import { Flag, XIcon } from "lucide-react";
import { FC, memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BaseNode from "../common/base-node";

import { generateHandleId } from "@/lib/handles";
import { NodeProps, useUpdateNodeInternals } from "@xyflow/react";
import { NewHandleInput } from "./new-handle-input";

const EntrypointNode: FC<NodeProps & { data: EntrypointNodeData }> = ({
  id: nodeId,
  data,
}) => {
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
      handles: data.handles ?? [
        {
          type: "text",
          id: generateHandleId("text", "prompt"),
          label: "prompt",
        },
      ],
    },
  });

  const formHandles = form.watch("handles");

  useEffect(() => {
    /**
     * See:
     * https://reactflow.dev/api-reference/hooks/use-update-node-internals
     */
    updateNodeInternals(nodeId);
  }, [nodeId, formHandles, updateNodeInternals]);

  const onHandleChange = (handle: EntrypointHandle) => {
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

  return (
    <BaseNode
      inputHandles={[]}
      outputHandles={formHandles}
      header={
        <>
          <Flag className="w-4 h-4" />
          <span className="font-medium text-sm">Entrypoint</span>
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

export default memo(EntrypointNode);
