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
import { generateHandleId } from "@/lib/handles";
import { zodResolver } from "@hookform/resolvers/zod";
import { NodeProps, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { FC, memo, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BaseNode, { BaseNodeHandle } from "../../common/base-node";
import { BaseNodeContent } from "../../common/base-node-content";
import { BaseNodeHeader } from "../../common/base-node-header";
import { FirecrawlAdvancedSettingsDialog } from "./advanced-settings-dialog";

export type FirecrawlAdvancedSettings = {
  jsonOptionsPrompt?: string | null;
  country?: string | null;
  url?: string | null;
  mobile?: boolean | null;
  timeout?: number | null;
  removeBase64Images?: boolean | null;
  blockAds?: boolean | null;
  proxy?: "basic" | "stealth" | null;
  formats?:
    | (
        | "markdown"
        | "html"
        | "rawHtml"
        | "links"
        | "screenshot"
        | "screenshot@fullPage"
        | "json"
      )[]
    | null;
  onlyMainContent?: boolean | null;
  waitFor?: number | null;
};

type FirecrawlNodeData = {
  credentialId: string;
} & FirecrawlAdvancedSettings;

type FirecrawlNodeProps = NodeProps & {
  data: FirecrawlNodeData;
};

const FirecrawlNode: FC<FirecrawlNodeProps> = ({ data, id: nodeId }) => {
  const { updateNodeData } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const formSchema = z.object({
    credentialId: z.string().min(2),
    advancedSettings: z.object({
      jsonOptionsPrompt: z.string().nullable(),
      country: z.string().nullable(),
      url: z.string().url().nullable(),
      mobile: z.boolean().nullable(),
      timeout: z.number().nullable(),
      removeBase64Images: z.boolean().nullable(),
      blockAds: z.boolean().nullable(),
      proxy: z.enum(["basic", "stealth"]).nullable(),
      formats: z
        .array(
          z.enum([
            "markdown",
            "html",
            "rawHtml",
            "links",
            "screenshot",
            "screenshot@fullPage",
            "json",
          ]),
        )
        .nullable(),
      onlyMainContent: z.boolean().nullable(),
      waitFor: z.number().nullable(),
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      credentialId: data.credentialId ?? "",
      advancedSettings: {
        jsonOptionsPrompt: data.jsonOptionsPrompt ?? null,
        country: data.country ?? null,
        url: data.url ?? null,
        mobile: data.mobile ?? false,
        timeout: data.timeout ?? null,
        removeBase64Images: data.removeBase64Images ?? false,
        blockAds: data.blockAds ?? false,
        proxy: data.proxy ?? "basic",
        formats: data.formats ?? [],
        onlyMainContent: data.onlyMainContent ?? false,
        waitFor: data.waitFor ?? null,
      },
    },
  });

  form.watch(() => {
    const formValues = form.getValues();

    const data: FirecrawlNodeData = {
      credentialId: formValues.credentialId,
      ...formValues.advancedSettings,
    };

    updateNodeData(nodeId, data);
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
                name="advancedSettings"
                render={({ field }) => (
                  <FirecrawlAdvancedSettingsDialog
                    data={field.value}
                    onChange={(values: typeof field.value) => {
                      field.onChange(values);
                    }}
                  >
                    <Button variant="outline" size="xs" type="button">
                      Advanced settings
                    </Button>
                  </FirecrawlAdvancedSettingsDialog>
                )}
              />
            </form>
          </Form>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
};

export default memo(FirecrawlNode);
