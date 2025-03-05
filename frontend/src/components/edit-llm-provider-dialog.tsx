import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LLMProvider, LLMProviderName } from "@/core/entities/llm-provider";
import { useAppConfigStore } from "@/core/store/app-config";
import { patchLLMProviderUsecase } from "@/core/usecases";
import { hookifyFunction } from "@/hooks/hookify-function";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProviderLogo } from "./logos/provider-logo";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";

export const EditLLMProviderDialog: FC<
  PropsWithChildren<{
    provider: LLMProvider;
  }>
> = ({ provider, children }) => {
  const { currentProject } = useAppConfigStore();

  const { execute: patchLLMProvider, isLoading: isPatchingLLMProvider } =
    hookifyFunction(
      patchLLMProviderUsecase.execute.bind(patchLLMProviderUsecase),
    );

  if (!currentProject) {
    throw new Error("Unexpected error: current project is not set");
  }

  const [open, setOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<LLMProviderName | null>(null);

  const formSchema = z.object({
    name: z.string().min(2).max(50),
    apiKey: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: provider.name,
      apiKey: undefined,
    },
  });

  useEffect(() => {
    form.reset({
      name: provider.name,
      apiKey: undefined,
    });
  }, [provider, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await patchLLMProvider(provider.id, {
      name: values.name,
      apiKey: values.apiKey,
    });

    handleOpenChange(false);
  }

  const reset = () => {
    setSelectedProvider(null);
    form.reset();
  };

  const handleOpenChange = (open: boolean) => {
    reset();
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit LLM provider</DialogTitle>
          <DialogDescription>
            Note that we won&apos;t show your API key for security reasons.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="flex flex-col gap-4 w-full">
            <Card
              className={cn(
                "bg-gradient-to-bl from-green-50 via-white to-gray-50 transition-all duration-300 w-full",
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex flex-row gap-2 items-center">
                  <ProviderLogo name={provider.providerType} />
                  <h2 className="text-lg font-medium">{selectedProvider}</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mt-4">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-8"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="OpenAI Account #1"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              This name is only for you to stay organized.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Leave blank to keep the same key"
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Your API key will be encrypted and stored
                              securely.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" isLoading={isPatchingLLMProvider}>
                        Save
                      </Button>
                    </form>
                  </Form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
