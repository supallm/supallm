import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "./ui/dialog";
import { FC, PropsWithChildren, useState } from "react";
import { Button } from "./ui/button";

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
