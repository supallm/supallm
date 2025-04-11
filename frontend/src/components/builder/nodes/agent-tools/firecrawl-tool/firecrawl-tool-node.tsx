import { AppSelect } from "@/components/app-select";
import { Firecrawl } from "@/components/logos/firecrawl";
import { SelectCredentials } from "@/components/select-credentials";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { generateHandleId } from "@/lib/handles";
import { zodResolver } from "@hookform/resolvers/zod";
import { NodeProps, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { Plus, Trash2 } from "lucide-react";
import { FC, memo, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BaseNode, { BaseNodeHandle } from "../../common/base-node";
import { BaseNodeContent } from "../../common/base-node-content";
import { BaseNodeHeader } from "../../common/base-node-header";

type FirecrawlNodeData = {
  credentialId: string;
  urls: string[];
  crawlerType: "crawl" | "scrape";
};

type FirecrawlNodeProps = NodeProps & {
  data: FirecrawlNodeData;
};

const FirecrawlNode: FC<FirecrawlNodeProps> = ({ data, id: nodeId }) => {
  const { updateNodeData } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const formSchema = z.object({
    credentialId: z.string().min(2),
    urls: z.array(z.string().url()),
    crawlerType: z.enum(["crawl", "scrape"]),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      credentialId: data.credentialId ?? "",
      urls: data.urls ?? [],
      crawlerType: data.crawlerType ?? "crawl",
    },
  });

  form.watch(() => {
    const formValues = form.getValues();
    updateNodeData(nodeId, formValues);
  });

  const outputHandles = useMemo<BaseNodeHandle[]>(() => {
    return [
      {
        label: "Crawled Data",
        id: generateHandleId("tools", "output"),
        type: "tools",
      },
    ];
  }, []);

  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [nodeId, outputHandles, updateNodeInternals]);

  const addUrl = () => {
    const currentUrls = form.getValues("urls");
    form.setValue("urls", [...currentUrls, ""]);
  };

  const removeUrl = (index: number) => {
    const currentUrls = form.getValues("urls");
    form.setValue(
      "urls",
      currentUrls.filter((_, i) => i !== index),
    );
  };

  return (
    <BaseNode
      nodeId={nodeId}
      outputHandles={outputHandles}
      inputHandles={[]}
      outputLabel="Connect"
      header={
        <BaseNodeHeader
          title="Firecrawl"
          logo={<Firecrawl width={10} height={10} />}
        />
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
                      providerType={"firecrawl"}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="crawlerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crawler Type</FormLabel>
                    <AppSelect
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      choices={[
                        { value: "crawl", label: "Crawl" },
                        { value: "scrape", label: "Scrape" },
                      ]}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>URLs</FormLabel>
                {form.getValues("urls").map((_, index) => (
                  <FormField
                    key={index}
                    control={form.control}
                    name={`urls.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-2">
                          <Input {...field} placeholder="Enter URL" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeUrl(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addUrl}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add URL
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
};

export default memo(FirecrawlNode);
