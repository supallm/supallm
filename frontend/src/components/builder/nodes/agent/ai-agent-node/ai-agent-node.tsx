import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { AIAgentNodeData } from "@/core/entities/flow/flow-ai-agent";
import { generateHandleId } from "@/lib/handles";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  NodeProps,
  Position,
  useReactFlow,
  useUpdateNodeInternals,
} from "@xyflow/react";
import { Bot } from "lucide-react";
import { FC, memo, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BaseNode from "../../common/base-node";
import { BaseNodeContent } from "../../common/base-node-content";
import { AIAgentAdvancedSettingsDialog } from "./advanced-settings-dialog";

type AIAgentChatCompletionNodeProps = NodeProps & {
  data: AIAgentNodeData;
};

const AIAgentChatCompletionNode: FC<AIAgentChatCompletionNodeProps> = ({
  data,
  id: nodeId,
}) => {
  const { updateNodeData } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const formSchema = z.object({
    advancedSettings: z.object({
      instructions: z.string().min(2),
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      advancedSettings: {
        instructions: data.instructions ?? "",
      },
    },
  });

  form.watch(() => {
    const formValues = form.getValues();

    const data: AIAgentNodeData = {
      instructions: formValues.advancedSettings.instructions,
    };
    updateNodeData(nodeId, data);
  });

  const outputHandles = useMemo(() => {
    return [
      {
        label: "Final result",
        id: generateHandleId("text", "response"),
        type: "text",
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
      outputLabel="Final Result"
      inputHandles={[
        {
          label: "Prompt",
          id: generateHandleId("text", "prompt"),
          type: "text",
        },
      ]}
      configHandles={[
        {
          label: "Conversation Memory",
          id: generateHandleId("memory", "conversation-memory"),
          type: "memory",
          position: Position.Left,
        },
        {
          label: "Model",
          id: generateHandleId("ai-model", "model"),
          type: "ai-model",
          position: Position.Left,
        },
        {
          label: "Tools",
          id: generateHandleId("tools", "tools"),
          type: "tools",
          position: Position.Left,
        },
      ]}
      header={
        <>
          <Bot width={20} height={20} />
          <span className="font-medium text-sm">AI Agent</span>
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
                name="advancedSettings"
                render={({ field }) => (
                  <AIAgentAdvancedSettingsDialog
                    data={field.value}
                    onChange={(values) => {
                      field.onChange(values);
                    }}
                  >
                    <Button variant="outline" size="xs" type="button">
                      Configure instructions
                    </Button>
                  </AIAgentAdvancedSettingsDialog>
                )}
              />
            </form>
          </Form>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
};

export default memo(AIAgentChatCompletionNode);
