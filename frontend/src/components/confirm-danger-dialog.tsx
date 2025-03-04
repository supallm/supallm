import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FC, PropsWithChildren, useState } from "react";
import { Button } from "./ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { Spacer } from "./spacer";

export const ConfirmDangerDialog: FC<
  PropsWithChildren<{
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmationText: string;
  }>
> = ({
  children,
  onConfirm,
  onCancel,
  title,
  description,
  confirmationText,
}) => {
  const [open, setOpen] = useState(false);

  const formSchema = z.object({
    confirmation: z.literal(confirmationText),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confirmation: "",
    },
  });

  const reset = () => {
    form.reset();
  };

  const onOpenChange = (open: boolean) => {
    setOpen(open);

    if (!open) {
      reset();
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    onConfirm();
    setOpen(false);
    reset();
  }

  async function handleCancel() {
    onCancel?.();
    setOpen(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description} Type <strong>{confirmationText}</strong> to confirm.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmation</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`Type ${confirmationText} to confirm`}
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Spacer size="xs" />
            <div className="space-x-3 flex justify-end">
              <Button variant="outline" onClick={handleCancel} type="button">
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
