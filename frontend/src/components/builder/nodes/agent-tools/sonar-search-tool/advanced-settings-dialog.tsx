import { AppSelect } from "@/components/app-select";
import { MultiTagInput } from "@/components/forms/multi-tag-input";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, PropsWithChildren, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  temperature: z.number().min(0).max(2).nullable(),
  maxTokens: z.number().min(1).nullable(),
  searchDomainWhitelist: z
    .array(
      z.string().refine(
        (domain) => {
          const domainPattern = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,6}?$/;
          return domainPattern.test(domain);
        },
        {
          message: "Invalid domain format. Use format like 'example.com'",
        },
      ),
    )
    .nullable(),
  searchDomainBlacklist: z
    .array(
      z.string().refine(
        (domain) => {
          const domainPattern = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,6}?$/;
          return domainPattern.test(domain);
        },
        {
          message: "Invalid domain format. Use format like 'example.com'",
        },
      ),
    )
    .nullable(),
  searchRecencyFilter: z.string().nullable(),
  returnRelatedQuestions: z.boolean().nullable(),
});

export const SonarAdvancedSettingsDialog: FC<
  PropsWithChildren<{
    data: {
      temperature: number | null;
      maxTokens: number | null;
      searchDomainFilter: string[] | null;
      searchRecencyFilter: string | null;
      returnRelatedQuestions: boolean | null;
    };
    onChange: (values: {
      temperature: number | null;
      maxTokens: number | null;
      searchDomainFilter: string[] | null;
      searchRecencyFilter: string | null;
      returnRelatedQuestions: boolean | null;
    }) => void;
  }>
> = ({ children, data, onChange }) => {
  const [open, setOpen] = useState(false);

  const searchDomainWhitelist = useMemo(
    () => data.searchDomainFilter?.filter((domain) => !domain.startsWith("-")),
    [data.searchDomainFilter],
  );
  const searchDomainBlacklist = useMemo(
    () => data.searchDomainFilter?.filter((domain) => domain.startsWith("-")),
    [data.searchDomainFilter],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      temperature: data.temperature ?? null,
      maxTokens: data.maxTokens ?? null,
      searchDomainWhitelist: searchDomainWhitelist ?? null,
      searchDomainBlacklist: searchDomainBlacklist ?? null,
      searchRecencyFilter: data.searchRecencyFilter ?? null,
      returnRelatedQuestions: data.returnRelatedQuestions ?? null,
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
    const searchDomainFilter = [
      ...(values.searchDomainWhitelist ?? []),
      ...(values.searchDomainBlacklist ?? []),
    ];
    onChange({
      temperature: values.temperature,
      maxTokens: values.maxTokens,
      searchDomainFilter,
      searchRecencyFilter: values.searchRecencyFilter,
      returnRelatedQuestions: values.returnRelatedQuestions,
    });
    setOpen(false);
  }

  async function handleSubmit() {
    await form.handleSubmit(onSubmit)();
  }

  const whitelistErrorMessage =
    form.formState.errors.searchDomainWhitelist?.[0]?.message;
  const blacklistErrorMessage =
    form.formState.errors.searchDomainBlacklist?.[0]?.message;

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
                name="searchDomainWhitelist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Search domain filter whitelist</FormLabel>
                    <FormControl>
                      <MultiTagInput
                        placeholder="e.g. 'example.com'"
                        tags={field.value ?? []}
                        maxTags={3}
                        formatInFunction={(tag) => tag.replace("-", "")}
                        formatOnEnterFunction={(tag) =>
                          tag.replace("https://", "").replace("http://", "")
                        }
                        onChange={(tags) => field.onChange(tags)}
                      />
                    </FormControl>
                    <FormDescription>
                      A list of domains to limit search results to. Currently
                      limited to only 3 domains for whitelisting.
                    </FormDescription>
                    <p className="text-destructive-foreground text-sm">
                      {whitelistErrorMessage}
                    </p>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="searchDomainBlacklist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Search domain filter blacklist</FormLabel>
                    <FormControl>
                      <MultiTagInput
                        placeholder="e.g. 'example.com'"
                        tags={field.value ?? []}
                        maxTags={3}
                        formatInFunction={(tag) => tag.replace("-", "")}
                        formatOutFunction={(tag) => `-${tag}`}
                        formatOnEnterFunction={(tag) =>
                          tag.replace("https://", "").replace("http://", "")
                        }
                        onChange={(tags) => field.onChange(tags)}
                      />
                    </FormControl>
                    <FormDescription>
                      A list of domains to limit search results to. Currently
                      limited to only 3 domains for blacklisting.
                    </FormDescription>
                    <p className="text-destructive-foreground text-sm">
                      {blacklistErrorMessage}
                    </p>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature</FormLabel>
                    <FormControl>
                      <NumberInput
                        placeholder="Default"
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        value={field.value ?? undefined}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      The amount of randomness in the response, valued between 0
                      and 2. Lower values (e.g., 0.1) make the output more
                      focused, deterministic, and less creative. Higher values
                      (e.g., 1.5) make the output more random and creative. Use
                      lower values for factual/information retrieval tasks and
                      higher values for creative applications.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxTokens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max tokens</FormLabel>
                    <FormControl>
                      <NumberInput
                        placeholder="Default"
                        value={field.value ?? undefined}
                        onChange={(value) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      The maximum number of completion tokens returned by the
                      API. Controls the length of the model&apos;s response. If
                      the response would exceed this limit, it will be
                      truncated. Higher values allow for longer responses but
                      may increase processing time and costs.
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="returnRelatedQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return related questions</FormLabel>
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
                      When enabled, provides follow-up question suggestions
                      related to the search query.
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="searchRecencyFilter"
                render={() => (
                  <FormItem>
                    <FormLabel>Search recency filter</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 'week', 'day'"
                        {...form.register("searchRecencyFilter")}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Filters search results based on time (e.g.,
                      &apos;week&apos;, &apos;day&apos;).
                    </FormDescription>
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
