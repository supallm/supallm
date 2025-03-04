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
import { ArrowRight } from "lucide-react";

export const ConfirmDialog: FC<
  PropsWithChildren<{
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>
> = ({ children, onConfirm, onCancel, title, description }) => {
  const [open, setOpen] = useState(false);

  const onOpenChange = (open: boolean) => {
    setOpen(open);
  };

  async function handleConfirm() {
    onConfirm();
    setOpen(false);
  }

  async function handleCancel() {
    onCancel?.();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleCancel} variant={"outline"}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
