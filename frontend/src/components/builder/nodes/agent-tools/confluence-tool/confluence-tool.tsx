import { Confluence } from "@/components/logos/confluence";
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

type ConfluenceToolProps = NodeProps & {
  data: {
    credentialId: string;
  };
};

const ConfluenceTool: FC<ConfluenceToolProps> = ({ data, id: nodeId }) => {
  const { updateNodeData } = useReactFlow();

  const formSchema = z.object({
    credentialId: z.string().min(1, "Credential is required"),
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
    updateNodeData(nodeId, {
      credentialId: formValues.credentialId,
    } satisfies ConfluenceToolProps["data"]);
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
          <Confluence width={20} height={20} />
          <span className="font-medium text-sm">Confluence Tool</span>
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
                      providerType="confluence"
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

export default memo(ConfluenceTool);
