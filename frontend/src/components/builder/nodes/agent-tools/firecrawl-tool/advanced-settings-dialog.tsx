import { AppSelect } from "@/components/app-select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, PropsWithChildren, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FirecrawlAdvancedSettings } from "./firecrawl-tool-node";

const formSchema = z.object({
  jsonOptionsPrompt: z.string().nullable(),
  country: z.string().nullable(),
  url: z
    .string()
    .refine(
      (value) =>
        value.length === 0 || z.string().url().safeParse(value).success,
      {
        message: "The URL is invalid",
      },
    )
    .nullable(),
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
});

export const FirecrawlAdvancedSettingsDialog: FC<
  PropsWithChildren<{
    data: FirecrawlAdvancedSettings;
    onChange: (values: z.infer<typeof formSchema>) => void;
  }>
> = ({ children, data, onChange }) => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...data,
    },
  });

  const onOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    setOpen(open);
  };

  async function handleCancel() {
    form.reset();
    setOpen(false);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    onChange({
      ...values,
    });
    setOpen(false);
  }

  async function handleSubmit() {
    await form.handleSubmit(onSubmit)();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-[900px]">
        <SheetHeader className="border-b">
          <SheetTitle>Advanced settings</SheetTitle>
          <SheetDescription>
            Customize the tool behavior according to your needs.
          </SheetDescription>
        </SheetHeader>
        <div className="p-4 overflow-y-auto space-y-4">
          <Form {...form}>
            <form className="space-y-8">
              <FormField
                control={form.control}
                name="url"
                render={() => (
                  <FormItem>
                    <FormLabel>URL to scrape</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 'https://example.com'"
                        {...form.register("url")}
                      />
                    </FormControl>
                    <FormDescription>
                      This URL is optional, if given, the agent will only scrape
                      the content of this URL. Otherwise, the agent will decide
                      what URL to scrape on its own.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jsonOptionsPrompt"
                render={() => (
                  <FormItem>
                    <FormLabel>Json options prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. 'Extract the title and the content of the page in the following JSON format: { title: string, content: string }'"
                        {...form.register("jsonOptionsPrompt")}
                      />
                    </FormControl>
                    <FormDescription>
                      Use this natural language prompt to specify how the
                      Firecrawl API should extract the data.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={() => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 'US'"
                        {...form.register("country")}
                      />
                    </FormControl>
                    <FormDescription>
                      ISO 3166-1 alpha-2 country code (e.g., 'US', 'AU', 'DE',
                      'JP')
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <AppSelect
                        onValueChange={(value) =>
                          field.onChange(Boolean(value))
                        }
                        defaultValue={field.value?.toString() ?? "false"}
                        choices={[
                          { value: "false", label: "False (default)" },
                          { value: "true", label: "True" },
                        ]}
                      />
                    </FormControl>
                    <FormDescription>
                      Set to true if you want to emulate scraping from a mobile
                      device. Useful for testing responsive pages and taking
                      mobile screenshots.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="blockAds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block ads</FormLabel>
                    <FormControl>
                      <AppSelect
                        onValueChange={(value) =>
                          field.onChange(Boolean(value))
                        }
                        defaultValue={field.value?.toString() ?? "true"}
                        choices={[
                          { value: "true", label: "True (default)" },
                          { value: "false", label: "False" },
                        ]}
                      />
                    </FormControl>
                    <FormDescription>
                      Set to true if you want to emulate scraping from a mobile
                      device. Useful for testing responsive pages and taking
                      mobile screenshots.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="onlyMainContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Only main content</FormLabel>
                    <FormControl>
                      <AppSelect
                        onValueChange={(value) =>
                          field.onChange(Boolean(value))
                        }
                        defaultValue={field.value?.toString() ?? "true"}
                        choices={[
                          { value: "true", label: "True (default)" },
                          { value: "false", label: "False" },
                        ]}
                      />
                    </FormControl>
                    <FormDescription>
                      Only return the main content of the page excluding
                      headers, navs, footers, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="waitFor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wait for delay</FormLabel>
                    <FormControl>
                      <NumberInput
                        placeholder="Default"
                        value={field.value ?? undefined}
                        onChange={(value) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Specify a delay in milliseconds before fetching the
                      content, allowing the page sufficient time to load.
                      (Default: 0)
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeout</FormLabel>
                    <FormControl>
                      <NumberInput
                        placeholder="Default"
                        value={field.value ?? undefined}
                        onChange={(value) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Timeout in milliseconds for the request. (Default: 30000)
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="removeBase64Images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remove base64 images</FormLabel>
                    <FormControl>
                      <AppSelect
                        onValueChange={(value) =>
                          field.onChange(Boolean(value))
                        }
                        defaultValue={field.value?.toString() ?? "false"}
                        choices={[
                          { value: "false", label: "False (default)" },
                          { value: "true", label: "True" },
                        ]}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Removes all base 64 images from the output, which may be
                      overwhelmingly long. The image's alt text remains in the
                      output, but the URL is replaced with a placeholder.
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="formats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format</FormLabel>
                    <FormControl>
                      <AppSelect
                        onValueChange={(value) => field.onChange([value])}
                        defaultValue={field.value?.[0] ?? "json"}
                        choices={[
                          { value: "markdown", label: "Markdown" },
                          { value: "html", label: "HTML" },
                          { value: "rawHtml", label: "Raw HTML" },
                          { value: "links", label: "Links" },
                          { value: "screenshot", label: "Screenshot" },
                          {
                            value: "screenshot@fullPage",
                            label: "Screenshot (full page)",
                          },
                          { value: "json", label: "JSON" },
                        ]}
                      />
                    </FormControl>
                    <FormDescription>
                      Specify the format you want to include in the output.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="proxy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proxy</FormLabel>
                    <FormControl>
                      <AppSelect
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                        defaultValue={field.value ?? "none"}
                        choices={[
                          {
                            value: "none",
                            label: "Let Firecrawl decide (default)",
                          },
                          { value: "basic", label: "Basic" },
                          { value: "stealth", label: "Stealth" },
                        ]}
                      />
                    </FormControl>
                    <FormDescription>
                      Specifies the type of proxy to use. basic: Proxies for
                      scraping sites with none to basic anti-bot solutions. Fast
                      and usually works. stealth: Stealth proxies for scraping
                      sites with advanced anti - bot solutions. Slower, but more
                      reliable on certain sites. If you do not specify a proxy,
                      Firecrawl will automatically attempt to determine which
                      one you need based on the target site.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <SheetFooter>
          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel} variant={"outline"}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Confirm</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
