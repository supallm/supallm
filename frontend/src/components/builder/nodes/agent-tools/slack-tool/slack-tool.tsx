import { Slack } from "@/components/logos/slack";
import { SelectCredentials } from "@/components/select-credentials";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { generateHandleId } from "@/lib/handles";
import { zodResolver } from "@hookform/resolvers/zod";
import { NodeProps, useReactFlow } from "@xyflow/react";
import { FC, memo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BaseNode from "../../common/base-node";
import { BaseNodeContent } from "../../common/base-node-content";

type SlackToolProps = NodeProps & {
  data: {
    name: string;
    description: string;
    credentialId: string;
  };
};

const SlackTool: FC<SlackToolProps> = ({ data, id: nodeId }) => {
  const { updateNodeData } = useReactFlow();

  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string(),
    credentialId: z.string().min(1, "Credential is required"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: data.name ?? "",
      description: data.description ?? "",
      credentialId: data.credentialId ?? "",
    },
  });

  form.watch(() => {
    const formValues = form.getValues();
    updateNodeData(nodeId, {
      name: formValues.name,
      description: formValues.description,
      credentialId: formValues.credentialId,
    } satisfies SlackToolProps["data"]);
  });

  // Define fixed input/output handles
  const outputHandles = [
    {
      type: "tools" as const,
      id: generateHandleId("tools", "ai-agent"),
      label: "AI Agent",
    },
  ];

  return (
    <BaseNode
      nodeId={nodeId}
      inputHandles={[]}
      outputHandles={outputHandles}
      header={
        <>
          <Slack width={20} height={20} />
          <span className="font-medium text-sm">Slack Tool</span>
        </>
      }
    >
      <BaseNodeContent>
        <div className="flex flex-col gap-4">
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
                      providerType={"slack"}
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

export default memo(SlackTool);
