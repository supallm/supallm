import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FC, PropsWithChildren, useState } from "react";
import { Message } from "./model-message-form";
import ModelMessageListForm from "./model-message-list-form";

export const ConfigureModelMessagesDialog: FC<
  PropsWithChildren<{
    initialMessages: Message[];
  }>
> = ({ children, initialMessages }) => {
  const [open, setOpen] = useState(false);
  const [messageList, setMessageList] = useState(initialMessages);

  const onOpenChange = (open: boolean) => {
    setOpen(open);
  };

  async function handleConfirm() {
    setOpen(false);
  }

  async function handleCancel() {
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader className="border-b">
          <SheetTitle>Configure chat messages</SheetTitle>
          <SheetDescription>
            Configure the initial conversation sent to the model.
          </SheetDescription>
        </SheetHeader>
        <div className="p-4 overflow-y-auto">
          <ModelMessageListForm messages={messageList} />
        </div>

        <SheetFooter>
          <Button onClick={handleCancel} variant={"outline"}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Continue</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
