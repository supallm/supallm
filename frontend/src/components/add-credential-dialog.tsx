import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { ProviderType, ProviderTypes } from "@/core/entities/credential";
import { useAppConfigStore } from "@/core/store/app-config";
import { createCredentialUsecase } from "@/core/usecases";
import { hookifyFunction } from "@/hooks/hookify-function";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProviderCardList } from "./credentials/provider-card-list";
import { ProviderLogo } from "./logos/provider-logo";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";

export const AddCredentialDialog: FC<
  PropsWithChildren<{
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
  }>
> = ({ isOpen, onOpenChange, children }) => {
  const { currentProject } = useAppConfigStore();
  const { execute: createCredential, isLoading: isCreatingCredential } =
    hookifyFunction(
      createCredentialUsecase.execute.bind(createCredentialUsecase),
    );

  if (!currentProject) {
    throw new Error("Unexpected error: current project is not set");
  }

  const [open, setOpen] = useState(isOpen);
  const [selectedProvider, setSelectedProvider] = useState<ProviderType | null>(
    null,
  );

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const formSchema = z.object({
    name: z.string().min(2).max(50),
    apiKey: z.string().min(2),
    providerType: z.enum(ProviderTypes),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      apiKey: "",
      providerType: "openai",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await createCredential({
      projectId: currentProject!.id,
      name: values.name,
      apiKey: values.apiKey,
      providerType: values.providerType,
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
      {!!children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Credential</DialogTitle>
          <DialogDescription>
            Note you can create multiple instances of the same provider to
            manage multiple API keys.
          </DialogDescription>
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
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your API Key"
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
                        <Button type="submit" isLoading={isCreatingCredential}>
                          Create credential
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
