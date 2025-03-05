import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Spacer } from "./spacer";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";

export const ConfirmDangerDialog: FC<
  PropsWithChildren<{
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmationText: string;
    asChild?: boolean;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
  }>
> = ({
  children,
  onConfirm,
  onCancel,
  title,
  description,
  confirmationText,
  asChild = true,
  isOpen = false,
  onOpenChange,
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

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

  const _onOpenChange = (open: boolean) => {
    setOpen(open);
    onOpenChange?.(open);

    if (!open) {
      reset();
    }
  };

  async function onSubmit() {
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
    <Dialog open={open} onOpenChange={_onOpenChange}>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
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
