import { AppSelect } from "@/components/app-select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { MistralResponseFormat } from "@/core/entities/flow/flow-mistral";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, PropsWithChildren, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  temperature: z.number().min(0).max(1).nullable(),
  responseFormat: z.object({
    type: z.enum(["text", "json_object"]),
  }),
});

export const MistralChatAdvancedSettingsDialog: FC<
  PropsWithChildren<{
    data: {
      temperature: number | null;
      responseFormat: MistralResponseFormat;
    };
    onChange: (values: z.infer<typeof formSchema>) => void;
  }>
> = ({ children, data, onChange }) => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      temperature: data.temperature ?? null,
      responseFormat: {
        type: data.responseFormat?.type ?? "text",
      },
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
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="responseFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response Format</FormLabel>
                    <FormControl>
                      <AppSelect
                        onValueChange={(value) => {
                          field.onChange({ type: value });
                        }}
                        defaultValue={field.value.type}
                        choices={[
                          {
                            value: "text",
                            label: "Text",
                          },
                          {
                            value: "json_object",
                            label: "JSON",
                          },
                        ]}
                      ></AppSelect>
                    </FormControl>
                  </FormItem>
                )}
              />

              <SheetFooter>
                <div className="flex justify-end gap-2">
                  <Button onClick={handleCancel} variant={"outline"}>
                    Cancel
                  </Button>
                  <Button type="submit">Confirm</Button>
                </div>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};
