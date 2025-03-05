import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { FC, useEffect, useState } from "react";
import { ProviderCardList } from "./llm-providers/provider-card-list";
import {
  LLMProviderName,
  LLMProviderNames,
} from "@/core/entities/llm-provider";
import { ProviderLogo } from "./logos/provider-logo";
import { Card, CardContent, CardHeader } from "./ui/card";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { createModelUsecase } from "@/core/usecases";
import { useAppConfigStore } from "@/core/store/app-config";
import { hookifyFunction } from "@/hooks/hookify-function";
import { SelectCredentials } from "./select-credentials";
import { Textarea } from "./ui/textarea";
import { DialogDescription } from "@radix-ui/react-dialog";
import { SelectModel } from "./select-model";

export const AddModelDialog: FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ isOpen, onOpenChange }) => {
  const { currentProject } = useAppConfigStore();
  const {
    execute: createModel,
    isLoading: isCreating,
    error: creationError,
  } = hookifyFunction(createModelUsecase.execute.bind(createModelUsecase));

  if (!currentProject) {
    throw new Error("Unexpected error: current project is not set");
  }

  const [open, setOpen] = useState(isOpen);
  const [selectedProvider, setSelectedProvider] =
    useState<LLMProviderName | null>(null);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const formSchema = z.object({
    name: z.string().min(2).max(50),
    credentialId: z.string().min(2),
    model: z.string().min(2),
    providerType: z.enum(LLMProviderNames),
    temperature: z.number().min(0).max(2),
    systemPrompt: z.string().min(0),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      credentialId: "",
      providerType: "openai",
      temperature: 1,
      systemPrompt: "",
      model: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("onSubmit");
    console.log(values);

    await createModel({
      projectId: currentProject!.id,
      name: values.name,
      credentialId: values.credentialId,
      providerType: values.providerType,
      model: values.model,
      systemPrompt: values.systemPrompt,
      temperature: values.temperature,
    });
    reset();
    onOpenChange(false);
  }

  const reset = () => {
    setSelectedProvider(null);
    form.reset();
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    onOpenChange(open);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add model</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          {!selectedProvider && (
            <ProviderCardList onSelected={setSelectedProvider} />
          )}
          {selectedProvider && (
            <div className="flex flex-col gap-4 w-full">
              <Card
                className={cn(
                  "bg-gradient-to-bl from-green-50 via-white to-gray-50 transition-all duration-300 w-full",
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex flex-row gap-2 items-center">
                    <ProviderLogo name={selectedProvider} />
                    <h2 className="text-lg font-medium">{selectedProvider}</h2>
                  </div>
                  <div>
                    <Button
                      variant={"outline"}
                      className="w-full"
                      size={"sm"}
                      onClick={reset}
                    >
                      Choose another provider
                    </Button>
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
                          name="credentialId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Credentials</FormLabel>
                              <SelectCredentials
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                providerType={selectedProvider}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="model"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Model</FormLabel>
                              <SelectModel
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                providerType={selectedProvider}
                              />
                              <FormMessage />
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
                                <Input
                                  step={0.1}
                                  type="number"
                                  placeholder="1"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(Number(e.target.value));
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="systemPrompt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>System Prompt</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="You are a helpful assistant..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" isLoading={isCreating}>
                          Create model
                        </Button>
                      </form>
                    </Form>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
