import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { FC, PropsWithChildren, useMemo, useState } from "react";
import { AddNodeDialogChoice } from "./add-node-dialog-choice";
import {
  AvailableNode,
  availableNodes,
  NodeCategory,
  NodeCategoryLabels,
} from "./available-nodes";

export const AddNodeDialog: FC<
  PropsWithChildren<{
    onNodeSelected: (node: AvailableNode) => void;
  }>
> = ({ children, onNodeSelected }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleNodeSelected = (node: AvailableNode) => {
    onNodeSelected(node);
    setOpen(false);
  };

  const filteredNodes = useMemo(() => {
    return availableNodes.filter((node) =>
      node.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  const filteredNodesByCategory = useMemo(() => {
    const byCategory = new Map<NodeCategory, AvailableNode[]>();

    for (const node of filteredNodes) {
      if (!byCategory.has(node.category)) {
        byCategory.set(node.category, []);
      }
      byCategory.get(node.category)?.push(node);
    }

    const expectedOrder: NodeCategory[] = [
      "ai-agent",
      "agent-model",
      "agent-memory",
      "agent-tools",
      "chat",
      "code",
    ];

    const byCategorySorted = Array.from(byCategory.entries()).sort((a, b) => {
      const aIndex = expectedOrder.indexOf(a[0]);
      const bIndex = expectedOrder.indexOf(b[0]);
      return aIndex - bIndex;
    });

    return byCategorySorted;
  }, [filteredNodes]);

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
        <div className="flex flex-col border-t overflow-y-auto">
          <div className="shrink-0 py-5 px-3">
            <Input
              placeholder="Search for a node..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {...filteredNodesByCategory.map(([category, nodes]) => {
            return (
              <div key={`${category}-container`} className="">
                <div
                  key={category}
                  className="sticky top-0 bg-background z-30 py-2 px-4 mt-0 border-b"
                >
                  <h3 className="text-sm font-medium">
                    {NodeCategoryLabels[category]}
                  </h3>
                </div>
                <div className="flex flex-col px-3 gap-3 py-3">
                  {nodes.map((node: AvailableNode) => {
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
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
