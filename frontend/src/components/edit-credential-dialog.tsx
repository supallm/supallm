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
import { Credential, ProviderType } from "@/core/entities/credential";
import { patchCredentialUsecase } from "@/core/usecases";
import { hookifyFunction } from "@/hooks/hookify-function";
import { useCurrentProjectOrThrow } from "@/hooks/use-current-project-or-throw";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProviderLogo } from "./logos/provider-logo";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";

interface EditCredentialDialogProps extends PropsWithChildren<{}> {
  provider: Credential;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const EditCredentialDialog: FC<EditCredentialDialogProps> = ({
  provider,
  children,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
}) => {
  const currentProject = useCurrentProjectOrThrow();

  const { execute: patchCredential, isLoading: isPatchingCredential } =
    hookifyFunction(
      patchCredentialUsecase.execute.bind(patchCredentialUsecase),
    );

  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderType | null>(
    null,
  );

  const formSchema = z.object({
    name: z.string().min(2).max(50),
    apiKey: z.string().min(10).optional(),
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
    await patchCredential(provider.id, {
      name: values.name,
      apiKey: values.apiKey,
      projectId: currentProject.id,
    });

    handleOpenChange(false);
  }

  const reset = () => {
    setSelectedProvider(null);
    form.reset();
  };

  const handleOpenChange = (open: boolean) => {
    reset();
    if (controlledOnOpenChange) {
      controlledOnOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  };

  useEffect(() => {
    setInternalOpen(!!controlledIsOpen);
  }, [controlledIsOpen]);

  return (
    <Dialog open={internalOpen} onOpenChange={handleOpenChange}>
      {!!children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Credential</DialogTitle>
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
                  <h2 className="text-lg font-medium">{provider.name}</h2>
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
                      <Button type="submit" isLoading={isPatchingCredential}>
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
