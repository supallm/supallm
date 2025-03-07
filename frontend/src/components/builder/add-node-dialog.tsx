import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { FC, PropsWithChildren } from "react";
import { ProviderLogo } from "../logos/provider-logo";
import { Input } from "../ui/input";
import { AddNodeDialogChoice } from "./add-node-dialog/add-node-dialog-choice";

const nodes = [
  {
    name: "OpenAI Chat Completion",
    description:
      "Use this node to send a message to an OpenAI Chat Completion model",
    logo: <ProviderLogo name="openai" width={30} height={30} />,
    commingSoon: false,
    onSelected: () => {},
  },
];

export const AddNodeDialog: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <Sheet>
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
        <div className="flex flex-col gap-2 p-3">
          <Input placeholder="Search for a node" />

          <AddNodeDialogChoice
            name="OpenAI Chat Completion"
            description="Use this node to send a message to an OpenAI Chat Completion model"
            logo={<ProviderLogo name="openai" width={30} height={30} />}
            commingSoon={false}
            onSelected={() => {}}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
