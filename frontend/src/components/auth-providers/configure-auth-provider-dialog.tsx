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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertMessage } from "../alert-message";
import { CredentialChoiceCard } from "../credentials/credential-choice-card";
import { Auth0Logo } from "../logos/auth0";
import { ClerkLogo } from "../logos/clerk";
import Firebase from "../logos/firebase";
import { Supabase } from "../logos/supabase";
import { Spacer } from "../spacer";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";

const authProviders = [
  {
    name: "Supabase",
    description: "Supabase Auth",
    logo: <Supabase className="w-6 h-6" />,
    commingSoon: false,
  },
  {
    name: "Firebase",
    description: "Firebase Auth",
    logo: <Firebase className="w-6 h-6" />,
    commingSoon: true,
  },
  {
    name: "Auth0",
    description: "Auth0 Auth",
    logo: <Auth0Logo className="w-6 h-6" />,
    commingSoon: true,
  },
  {
    name: "Clerk",
    description: "Clerk Auth",
    logo: <ClerkLogo className="w-6 h-6" />,
    commingSoon: true,
  },
];

export const ConfigureAuthProviderDialog: FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ isOpen, onOpenChange }) => {
  const [open, setOpen] = useState(isOpen);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const formSchema = z.object({
    secretKey: z.string().min(2, "Secret key is required"),
    projectUrl: z.string().min(2, "Project URL is required"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      secretKey: "",
      projectUrl: "",
    },
  });

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    onOpenChange(open);
    reset();
  };

  const reset = () => {
    setSelectedProvider(null);
    form.reset();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Configuring provider:", selectedProvider);
    console.log("Secret Key:", values.secretKey);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-screen">
        <DialogHeader>
          <DialogTitle>Configure Authentication Provider</DialogTitle>
          <DialogDescription>
            Select the provider that you are using to authenticate your users.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          {!selectedProvider && (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              {authProviders.map((provider) => (
                <CredentialChoiceCard
                  key={provider.name}
                  name={provider.name}
                  description={provider.description}
                  logo={provider.logo}
                  commingSoon={provider.commingSoon}
                  onSelected={() => setSelectedProvider(provider.name)}
                />
              ))}
            </div>
          )}
          {selectedProvider && (
            <div className="flex flex-col gap-4 w-full">
              <Card
                className={cn(
                  "bg-gradient-to-bl from-green-50 via-white to-gray-50 transition-all duration-300 w-full",
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div className="flex flex-col gap-2 align-left text-left">
                    <h2 className="text-lg font-medium text-left">
                      {selectedProvider}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      To authenticate your requests using Supabase, you need to
                      provide your Supabase Project URL and JWT secret. The
                      secret will allow Supallm to securely validate the access
                      token sent by your application.
                    </p>
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
                    <AlertMessage
                      variant="info"
                      message={
                        "To find these info, go to your Supabase dashboard go to Project Settings > Data API"
                      }
                    ></AlertMessage>
                    <Spacer size={"sm"} />
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                      >
                        <FormField
                          control={form.control}
                          name="projectUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project URL</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your project URL"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="secretKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>JWT Secret Key</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your secret key"
                                  type="password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit">
                          Configure {selectedProvider}
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
