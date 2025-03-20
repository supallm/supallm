"use client";

import { loginWithEmailAndPassword } from "@/actions";
import { AlertMessage } from "@/components/alert-message";
import Logo from "@/components/logo";
import { Spacer } from "@/components/spacer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OverviewRoute } from "@/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const LoginPage = () => {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoggingIn(true);
    try {
      const result = await loginWithEmailAndPassword(
        values.email,
        values.password,
      );

      if (result?.error) {
        setLoginError(result.error);
        return;
      }

      if (result?.success) {
        router.push(OverviewRoute.path());
      }

      setIsLoggingIn(false);
    } catch (error) {
      setLoginError("Invalid credentials");
      setIsLoggingIn(false);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center mb-30">
        <Logo width={30} iconOnly={true} />
        <h1 className="text-2xl font-bold mt-3">Login</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Please enter your credentials to login
        </p>

        <Spacer size={"sm"} />
        <Card className="min-w-[300px]">
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="example@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="******"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!!loginError && (
                  <AlertMessage
                    message={"Invalid credentials"}
                    variant={"danger"}
                  />
                )}

                <Button
                  isLoading={isLoggingIn}
                  type="submit"
                  className="w-full"
                >
                  Login
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
