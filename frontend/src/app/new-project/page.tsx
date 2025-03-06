"use client";

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
import { createProjectUsecase } from "@/core/usecases";
import { hookifyFunction } from "@/hooks/hookify-function";
import { OverviewRoute } from "@/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const NewProjectPage = () => {
  const {
    execute: createProject,
    error: createProjectError,
    isLoading: isCreatingProject,
  } = hookifyFunction(createProjectUsecase.execute.bind(createProjectUsecase));

  const router = useRouter();

  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createProject({ name: values.name });
    router.push(OverviewRoute.path());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center mb-30">
        <Logo width={70} iconOnly={true} />
        <h1 className="text-2xl font-bold mt-3">Create a new project</h1>
        <p className="text-sm text-muted-foreground mt-1">
          It takes less than a minute to get started
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My awesome ap" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!!createProjectError && (
                  <AlertMessage
                    message={
                      "An error occurred while creating the project. Please try again and contact our support team if the issue persists."
                    }
                    variant={"danger"}
                  />
                )}

                <Button
                  isLoading={isCreatingProject}
                  type="submit"
                  className="w-full"
                >
                  Create Project
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewProjectPage;
