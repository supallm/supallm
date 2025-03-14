import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EntrypointNodeData } from "@/core/entities/flow/flow-entrypoint";
import { useCurrentProjectOrThrow } from "@/hooks/use-current-project-or-throw";
import { getAuthToken } from "@/lib/auth";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Pause, PlayIcon } from "lucide-react";
import { FC, PropsWithChildren, useState } from "react";
import { FlowEventData, initSupallm, Unsubscribe } from "supallm";
import { EmptyState } from "../../empty-state";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { TestFlowBottomPanel } from "./text-flow-bottom-panel";

export const TestFlowDialog: FC<
  PropsWithChildren<{
    flowId: string;
    data: EntrypointNodeData | undefined;
    onChange: (values: string) => void;
  }>
> = ({ children, data, onChange, flowId }) => {
  const { id: projectId } = useCurrentProjectOrThrow();
  const [open, setOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const [results, setResults] = useState<FlowEventData[]>([]);

  const [inputs, setInputs] = useState<Record<string, string>>({});

  const [unsubscribes, setUnsubscribes] = useState<Unsubscribe[]>([]);

  async function onOpenChange(open: boolean) {
    setOpen(open);
    if (!open) {
      reset();
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    }
  }

  const reset = () => {
    setResults([]);
    setInputs({});
    setUnsubscribes([]);
    setIsRunning(false);
  };

  const handleRunFlow = async () => {
    const token = await getAuthToken();
    if (!token) {
      return;
    }

    setResults([]);

    const supallm = initSupallm(
      {
        projectId,
        publicKey: process.env.SUPALLM_PUBLIC_KEY!,
      },
      {
        apiUrl: "http://localhost:3001",
        mocked: false,
      },
    );

    supallm.setAccessToken(token);

    const subscription = supallm
      .runFlow({
        flowId,
        inputs: inputs,
      })
      .subscribe();

    setIsRunning(true);

    const unsubscribeData = subscription.on("data", (data) => {
      setResults((prev) => [...prev, data]);
    });

    const unsubscribeComplete = subscription.on("complete", () => {
      setIsRunning(false);
    });

    setUnsubscribes([unsubscribeData, unsubscribeComplete]);
  };

  const handlePause = () => {
    setIsRunning(false);
    unsubscribes.forEach((unsubscribe) => unsubscribe());
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
                  <div key={handle.label}>
                    <Label className="mb-2">{handle.label}</Label>
                    <Input
                      value={inputs[handle.label] ?? ""}
                      onChange={(e) => {
                        setInputs({
                          ...inputs,
                          [handle.label]: e.target.value,
                        });
                      }}
                      placeholder="Enter value"
                    />
                  </div>
                );
              })}
              {!isRunning && (
                <Button
                  startContent={<PlayIcon className="w-4 h-4" />}
                  onClick={handleRunFlow}
                >
                  Test flow
                </Button>
              )}
              {isRunning && (
                <Button
                  startContent={<Pause className="w-4 h-4" />}
                  onClick={handlePause}
                >
                  Stop flow
                </Button>
              )}
            </>
          )}
        </div>

        <TestFlowBottomPanel
          events={results}
          isRunning={isRunning}
          entrypointNodeData={data}
          resultNodeData={data}
          inputs={
            data?.handles?.map((h) => ({
              label: h.label,
              value: inputs[h.label] ?? "<your-value>",
            })) ?? []
          }
          flowId={flowId}
        />
      </SheetContent>
    </Sheet>
  );
};
