import { PostgresLogo } from "@/components/logos/postgres";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { generateHandleId } from "@/lib/handles";
import { zodResolver } from "@hookform/resolvers/zod";
import { NodeProps, useReactFlow } from "@xyflow/react";
import { Database } from "lucide-react";
import { FC, memo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CodePreview } from "../../code/code-executor/code-preview";
import BaseNode from "../../common/base-node";
import { BaseNodeContent } from "../../common/base-node-content";
import {
  CodeEditorDialog,
  CodeEditorOnChangeParams,
} from "../../common/code-editor-dialog";

type PostgresQueryToolProps = NodeProps & {
  data: {
    query: string;
    name: string;
    description: string;
  };
};

const defaultQuery = `-- Write your SQL query here
SELECT * FROM your_table
WHERE condition = true
LIMIT 10;`;

const PostgresQueryTool: FC<PostgresQueryToolProps> = ({
  data,
  id: nodeId,
}) => {
  const { updateNodeData } = useReactFlow();

  const formSchema = z.object({
    query: z.string().min(1, "Query cannot be empty"),
    name: z.string().min(1, "Name is required"),
    description: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      query: data.query ?? defaultQuery,
      name: data.name ?? "",
      description: data.description ?? "",
    },
  });

  const handleCodeChange = (values: CodeEditorOnChangeParams) => {
    form.setValue("query", values.code);
    updateNodeData(nodeId, {
      ...data,
      query: values.code,
    });
  };

  form.watch(() => {
    const formValues = form.getValues();
    console.log("formValues", formValues);

    updateNodeData(nodeId, {
      name: formValues.name,
      description: formValues.description,
      query: formValues.query,
    });
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
          <PostgresLogo className="w-4 h-4" />
          <span className="font-medium text-sm">Postgres Query tool</span>
        </>
      }
    >
      <BaseNodeContent>
        <div className="flex flex-col gap-4">
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name of the tool</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Retrieve all users"
                        {...form.register("name")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...form.register("description")}
                        placeholder="Use this tool to retrieve all users from the database..."
                        className="resize-none"
                      />
                    </FormControl>
                    <FormSubLabel>
                      Describe to the AI agent what this tool does and when to
                      use it.
                    </FormSubLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <div className="border rounded p-2 bg-gray-100 max-h-[100px] overflow-hidden">
                  <pre className="text-xs">
                    <CodePreview
                      language="sql"
                      filename="query.sql"
                      code={form.getValues("query")}
                    />
                  </pre>
                </div>
              </div>
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CodeEditorDialog
                        language="pgsql"
                        title="Query Editor"
                        description="Edit the SQL query to be executed by the AI Agent"
                        data={{
                          code: field.value,
                        }}
                        onChange={handleCodeChange}
                      >
                        <Button
                          size={"sm"}
                          variant="outline"
                          startContent={<Database className="w-4 h-4" />}
                        >
                          Query Editor
                        </Button>
                      </CodeEditorDialog>
                    </FormControl>
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

export default memo(PostgresQueryTool);
