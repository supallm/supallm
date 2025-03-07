import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { FC, PropsWithChildren, useState } from "react";
import { AddNodeDialogChoice } from "./add-node-dialog-choice";
import { AvailableNode, availableNodes } from "./available-nodes";

export const AddNodeDialog: FC<
  PropsWithChildren<{
    onNodeSelected: (node: AvailableNode) => void;
  }>
> = ({ children, onNodeSelected }) => {
  const [open, setOpen] = useState(false);

  const handleNodeSelected = (node: AvailableNode) => {
    onNodeSelected(node);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Add a new node</SheetTitle>
          <SheetDescription>
            Feel free to request mode node types by opening an issue on
            <Link
              href="https://github.com/supallm/supallm"
              className="pl-1 font-semibold"
            >
              GitHub
            </Link>
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-3 border-t py-5 overflow-y-auto">
          {availableNodes.map((node: AvailableNode) => {
            return (
              <AddNodeDialogChoice
                key={crypto.randomUUID()}
                name={node.name}
                description={node.description}
                logo={node.logo}
                commingSoon={node.commingSoon}
                onSelected={() => handleNodeSelected(node)}
              />
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
