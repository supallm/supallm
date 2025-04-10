import { strictToolNameRule } from "@/components/builder/utils";
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

const formSchema = z.object({
  outputFieldName: strictToolNameRule,
  outputDescription: z.string().min(2),
});

export const SDKNotifierToolAdvancedSettingsDialog: FC<
  PropsWithChildren<{
    data: {
      outputFieldName: string;
      outputDescription: string;
    };
    onChange: (values: z.infer<typeof formSchema>) => void;
  }>
> = ({ children, data, onChange }) => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      outputFieldName: data.outputFieldName ?? "",
      outputDescription: data.outputDescription ?? "",
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
    onChange(values);
    setOpen(false);
  }

  async function handleSubmit() {
    form.handleSubmit(onSubmit)();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-[900px]">
        <SheetHeader className="border-b">
          <SheetTitle>Advanced settings</SheetTitle>
          <SheetDescription>
            Customize the model behavior according to your needs.
          </SheetDescription>
        </SheetHeader>
        <div className="p-4 overflow-y-auto space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="outputFieldName"
                render={() => (
                  <FormItem>
                    <FormLabel>Output field name</FormLabel>
                    <FormControl>
                      <Input
                        {...form.register("outputFieldName")}
                        placeholder="e.g. status"
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      This is the field name that you will have to watch in the
                      SDK.
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="outputDescription"
                render={() => (
                  <FormItem>
                    <FormLabel>Output description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...form.register("outputDescription")}
                        placeholder="e.g. Return your current status between: thinking, running, completed, failed"
                        className="h-30"
                      />
                    </FormControl>
                    <FormDescription>
                      This is the instructions we will provide to the Agent to
                      format the value of the field.
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
