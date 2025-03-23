import { AppSelect } from "@/components/app-select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { generateHandleId } from "@/lib/handles";
import { zodResolver } from "@hookform/resolvers/zod";
import { NodeProps, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { FC, memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BaseNode from "../../common/base-node";
import { BaseNodeContent } from "../../common/base-node-content";

type HttpRequestNodeProps = NodeProps & {
  data: {
    url: string;
    method: string;
  };
};

const HttpRequestNode: FC<HttpRequestNodeProps> = ({ data, id: nodeId }) => {
  const { updateNodeData } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const formSchema = z.object({
    url: z.string().url("Invalid URL"),
    method: z.string().min(1, "Method cannot be empty"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      url: data.url ?? "",
      method: data.method ?? "GET",
    },
  });

  form.watch(() => {
    const formValues = form.getValues();
    updateNodeData(nodeId, formValues);
  });

  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [nodeId, updateNodeInternals]);

  return (
    <BaseNode
      nodeId={nodeId}
      outputHandles={[
        {
          label: "Response",
          id: generateHandleId("text", "response"),
          type: "text",
        },
      ]}
      inputHandles={[
        {
          label: "JSON body",
          id: generateHandleId("text", "query"),
          type: "text",
        },
        {
          label: "Query string",
          id: generateHandleId("text", "query"),
          type: "text",
        },
      ]}
      header={
        <>
          <span className="font-medium text-sm">HTTP Request</span>
        </>
      }
    >
      <BaseNodeContent>
        <div className="flex flex-col gap-2">
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://my-api.com/webhook"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HTTP Method</FormLabel>
                    <FormControl>
                      <AppSelect
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        choices={[
                          { value: "GET", label: "GET" },
                          { value: "POST", label: "POST" },
                          { value: "PUT", label: "PUT" },
                          { value: "DELETE", label: "DELETE" },
                        ]}
                        placeholder="Select HTTP Method"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button size={"sm"} variant="outline">
                Advanced settings
              </Button>
            </form>
          </Form>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
};

export default memo(HttpRequestNode);
