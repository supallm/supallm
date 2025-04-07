import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { EntrypointNodeData } from "@/core/entities/flow/flow-entrypoint";
import { useCurrentProjectOrThrow } from "@/hooks/use-current-project-or-throw";

import { getAuthToken } from "@/actions";
import { Chip } from "@/components/chip";
import { useValidatedEnv } from "@/context/env/use-env";
import { FlowNode } from "@/core/entities/flow";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Edge } from "@xyflow/react";
import { Pause, PlayIcon } from "lucide-react";
import { FC, PropsWithChildren, useState } from "react";
import {
  FlowResultStreamEvent,
  FlowSubscription,
  initSupallm,
  Unsubscribe,
} from "supallm/browser";
import { EmptyState } from "../../empty-state";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { RunningFlow } from "./running-flow";
import { TestFlowBottomPanel } from "./text-flow-bottom-panel";

export const TestFlowDialog: FC<
  PropsWithChildren<{
    flowId: string;
    data: EntrypointNodeData | undefined;
    onChange: (values: string) => void;
    nodes: FlowNode[];
    edges: Edge[];
  }>
> = ({ children, data, flowId, nodes, edges }) => {
  const env = useValidatedEnv();
  const { id: projectId } = useCurrentProjectOrThrow();
  const [open, setOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const [results, setResults] = useState<FlowResultStreamEvent[]>([]);

  const [inputs, setInputs] = useState<Record<string, string>>({});

  const [unsubscribes, setUnsubscribes] = useState<Unsubscribe[]>([]);

  const [flowError, setFlowError] = useState<string | null>(null);

  const [runId, setRunId] = useState<string>(crypto.randomUUID());

  const [sessionId, setSessionId] = useState<string | null>(
    crypto.randomUUID(),
  );

  const [flowSubscription, setFlowSubscription] =
    useState<FlowSubscription | null>(null);

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
    setRunId(crypto.randomUUID());
    const token = await getAuthToken();

    if (!token) {
      return;
    }

    setResults([]);
    setFlowError(null);

    const supallm = initSupallm(
      {
        projectId,
      },
      {
        apiUrl: env.SUPALLM_API_URL,
      },
      {
        origin: "dashboard",
      },
    );

    supallm.setUserToken(token);

    const subscription = supallm
      .run({
        flowId,
        inputs: inputs,
        sessionId: sessionId ?? undefined,
      })
      .subscribe();

    setFlowSubscription(subscription);

    setIsRunning(true);

    const unsubscribeResult = subscription.on("flowResultStream", (data) => {
      setResults((prev) => [...prev, data]);
    });

    const unsubscribeFail = subscription.on("flowFail", (error) => {
      setFlowError(error.message);
      setIsRunning(false);
    });

    const unsubscribeEnd = subscription.on("flowEnd", () => {
      setIsRunning(false);
    });

    setUnsubscribes([unsubscribeResult, unsubscribeFail, unsubscribeEnd]);
  };

  const handlePause = () => {
    setIsRunning(false);
    unsubscribes.forEach((unsubscribe) => unsubscribe());
  };

  const handleResetSession = () => {
    setSessionId(crypto.randomUUID());
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full gap-0">
        {/* Content */}
        <div className="flex justify-between h-full">
          {/* Left panel */}
          <div className="h-full grow">
            <RunningFlow
              key={runId}
              initialNodes={nodes}
              initialEdges={edges}
              flowSubscription={flowSubscription}
            />
          </div>

          {/* Right panel */}
          <div className="w-1/4 min-w-[500px] flex flex-col border-l h-full justify-start shrink-0">
            {/* Right Top Panel */}
            <div className="p-4 overflow-y-auto space-y-4 flex flex-col justify-start min-h-[180px] max-h-1/2">
              {!data?.handles?.length && (
                <>
                  <EmptyState
                    title="No inputs found"
                    description="We have not found any input parameter. Please check your entrypoint node."
                  ></EmptyState>
                </>
              )}
              <div className="w-2/3">
                <Chip variant="outline" size="sm">
                  <div className="flex justify-between items-center gap-2">
                    <div className="text-xs">
                      Session ID: {sessionId?.slice(0, 16)}...
                    </div>
                    <Button
                      variant={"outline"}
                      size={"xs"}
                      onClick={handleResetSession}
                    >
                      Reset session
                    </Button>
                  </div>
                </Chip>
              </div>

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
            {/* Right Bottom Panel */}
            <div className="grow overflow-hidden">
              <TestFlowBottomPanel
                events={results}
                isRunning={isRunning}
                entrypointNodeData={data}
                resultNodeData={data}
                flowError={flowError}
                inputs={
                  data?.handles?.map((h) => ({
                    label: h.label,
                    value: inputs[h.label] ?? "<your-value>",
                  })) ?? []
                }
                flowId={flowId}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
