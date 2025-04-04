import { Airtable } from "@/components/logos/airtable";
import { SelectCredentials } from "@/components/select-credentials";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormSubLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { generateHandleId } from "@/lib/handles";
import { zodResolver } from "@hookform/resolvers/zod";
import { NodeProps, useReactFlow } from "@xyflow/react";
import Link from "next/link";
import { FC, memo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BaseNode from "../../common/base-node";
import { BaseNodeContent } from "../../common/base-node-content";

type AirtableToolProps = NodeProps & {
  data: {
    name: string;
    description: string;
    credentialId: string;
    baseId: string;
    tableId: string;
  };
};

const AirtableTool: FC<AirtableToolProps> = ({ data, id: nodeId }) => {
  const { updateNodeData } = useReactFlow();

  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string(),
    credentialId: z.string().min(1, "Credential is required"),
    baseId: z.string().min(1, "Base ID is required"),
    tableId: z.string().min(1, "Table name is required"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: data.name ?? "",
      description: data.description ?? "",
      credentialId: data.credentialId ?? "",
      baseId: data.baseId ?? "",
      tableId: data.tableId ?? "",
    },
  });

  form.watch(() => {
    const formValues = form.getValues();
    updateNodeData(nodeId, {
      name: formValues.name,
      description: formValues.description,
      credentialId: formValues.credentialId,
      baseId: formValues.baseId,
      tableId: formValues.tableId,
    } satisfies AirtableToolProps["data"]);
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
          <Airtable width={20} height={20} />
          <span className="font-medium text-sm">Airtable Tool</span>
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
                      providerType="airtable"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="baseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base ID</FormLabel>
                    <FormControl>
                      <Input placeholder="app1234567890" {...field} />
                    </FormControl>
                    <FormSubLabel>
                      <Link
                        className="text-blue-500"
                        href="https://support.airtable.com/v1/docs/finding-airtable-ids#finding-base-table-and-view-ids-from-urls"
                        target="_blank"
                      >
                        How to find your Base ID
                      </Link>
                    </FormSubLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tableId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table ID</FormLabel>
                    <FormControl>
                      <Input placeholder="tbl1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormSubLabel>
                      <Link
                        className="text-blue-500"
                        href="https://support.airtable.com/v1/docs/finding-airtable-ids#finding-base-table-and-view-ids-from-urls"
                        target="_blank"
                      >
                        How to find your Table ID
                      </Link>
                    </FormSubLabel>
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

export default memo(AirtableTool);
