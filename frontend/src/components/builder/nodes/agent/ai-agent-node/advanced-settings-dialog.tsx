import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

const triageAgentExample = `You are an issue triage agent. You will be given a user query and your job will be to handle it.

Before getting started, you will need to use the following tools to get the necessary information:

1. Use the summary-tool to summarize the user query.
2. Use the issue-type-classifier tool to determine the type of issue the user is experiencing.
3. Use the priority-tool to determine the best way to handle the issue.

Once you have these pieces of information, use the slack-tool to notify our support team.

Always send the notification in the following format:
\`\`\`
<summary>
<issue-type>
<priority>
\`\`\`

`;

const placeholder = triageAgentExample;

const hint = `Explain the role and mission of the agent. Describe the tools available and when to use them. If needed, provide examples of how the agent should behave in different situations.`;

const formSchema = z.object({
  instructions: z.string().min(2),
});

export const AIAgentAdvancedSettingsDialog: FC<
  PropsWithChildren<{
    data: {
      instructions: string;
    };
    onChange: (values: z.infer<typeof formSchema>) => void;
  }>
> = ({ children, data, onChange }) => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instructions: data.instructions ?? "",
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

  async function handleConfirm() {
    await onSubmit(form.getValues());
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-[900px] w-[900px]">
        <SheetHeader className="border-b">
          <SheetTitle>AI Agent Settings</SheetTitle>
          <SheetDescription>
            Control the behavior of the AI Agent.
          </SheetDescription>
        </SheetHeader>
        <div className="p-4 overflow-y-auto space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormItem>
                <FormLabel>Instructions</FormLabel>
                <FormControl>
                  <Textarea
                    {...form.register("instructions")}
                    placeholder={placeholder}
                    className="min-h-[400px]"
                  />
                </FormControl>
                <FormMessage />
                <FormDescription>{hint}</FormDescription>
              </FormItem>
              <FormItem>
                <FormLabel>Examples</FormLabel>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    className="rounded-lg"
                    variant={"outline"}
                    onClick={() =>
                      form.setValue("instructions", triageAgentExample)
                    }
                  >
                    Triage Agent Example
                  </Button>
                </div>
              </FormItem>
            </form>
          </Form>
        </div>
        <SheetFooter>
          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel} variant={"outline"}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
