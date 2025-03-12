import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EntrypointNodeData } from "@/core/entities/flow/flow-entrypoint";
import { getAuthToken } from "@/lib/auth";
import { supallm } from "@/lib/supallm";
import { Label } from "@radix-ui/react-dropdown-menu";
import { PlayIcon } from "lucide-react";
import { FC, PropsWithChildren, useState } from "react";
import { FlowEventData } from "supallm";
import { EmptyState } from "../../empty-state";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import LogsPane from "./logs-pane";

export const TestFlowDialog: FC<
  PropsWithChildren<{
    data: EntrypointNodeData | undefined;
    onChange: (values: string) => void;
  }>
> = ({ children, data, onChange }) => {
  const [open, setOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const [results, setResults] = useState<FlowEventData[]>([]);

  const [inputs, setInputs] = useState<Record<string, string>>({});

  async function onOpenChange(open: boolean) {
    setOpen(open);
  }

  const handleRunFlow = async () => {
    const token = await getAuthToken();
    if (!token) {
      return;
    }

    supallm.setAccessToken(token);

    const emitter = await supallm
      .runFlow({
        flowId: "something",
        inputs: inputs,
      })
      .subscribe();

    setIsRunning(true);

    emitter.on("data", (data) => {
      console.log("data", data);
      setResults((prev) => [...prev, data]);
    });

    emitter.on("complete", () => {
      setIsRunning(false);
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-[900px]">
        <SheetHeader className="border-b">
          <SheetTitle>Test your flow</SheetTitle>
          <SheetDescription>
            Test your flow with the parameters below.
          </SheetDescription>
        </SheetHeader>
        <div className="p-4 overflow-y-auto space-y-4 flex flex-col justify-between">
          {!data?.handles?.length && (
            <>
              <EmptyState
                title="No inputs found"
                description="We have not found any input parameter. Please check your entrypoint node."
              ></EmptyState>
            </>
          )}
          {!!data?.handles?.length && (
            <>
              {data.handles?.map((handle) => {
                return (
                  <div key={handle.id}>
                    <Label className="mb-2">{handle.label}</Label>
                    <Input
                      value={inputs[handle.id] ?? ""}
                      onChange={(e) => {
                        setInputs({
                          ...inputs,
                          [handle.id]: e.target.value,
                        });
                      }}
                      placeholder="Enter value"
                    />
                  </div>
                );
              })}
              <Button
                isLoading={isRunning}
                startContent={<PlayIcon className="w-4 h-4" />}
                onClick={handleRunFlow}
              >
                Test flow
              </Button>
            </>
          )}
        </div>

        <LogsPane events={results} isRunning={isRunning} />
      </SheetContent>
    </Sheet>
  );
};
