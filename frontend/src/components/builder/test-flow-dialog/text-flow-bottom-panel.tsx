import { AlertMessage } from "@/components/alert-message";
import { SdkCodeExample } from "@/components/sdk-code-example";
import { Spacer } from "@/components/spacer";
import { Spinner } from "@/components/spinner";
import { EntrypointNodeData } from "@/core/entities/flow/flow-entrypoint";
import { ResultNodeData } from "@/core/entities/flow/flow-result";
import {
  getInspectingNode,
  useCurrentFlowInspectorStore,
} from "@/core/store/flow";
import { useCurrentProjectOrThrow } from "@/hooks/use-current-project-or-throw";
import { cn } from "@/lib/utils";
import { BookCheck, Inspect, LogsIcon, MessageCircle } from "lucide-react";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { JsonView, allExpanded, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { FlowResultStreamEvent } from "supallm";

interface LogsPaneProps {
  events: FlowResultStreamEvent[];
  isRunning: boolean;
  entrypointNodeData: EntrypointNodeData | undefined;
  resultNodeData: ResultNodeData | undefined;
  flowId: string;
  inputs: { label: string; value: string }[];
  flowError: string | null;
  agentNotifications: {
    data: string;
    nodeId: string;
    nodeType: string;
    outputField: string;
  }[];
}

const PaneButton: FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  startContent?: React.ReactNode;
}> = ({ active, onClick, children, startContent }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-2 cursor-pointer hover:bg-gray-200 text-gray-700 flex items-center gap-1 text-sm",
        active ? "bg-gray-200 text-gray-900" : "bg-gray-100",
      )}
    >
      {startContent}
      {children}
    </button>
  );
};

const EmptyLogs: FC = () => {
  return <p className="text-muted-foreground text-sm">No logs available</p>;
};

const LogList: FC<{ events: FlowResultStreamEvent[] }> = ({ events }) => {
  const numberOfLatestEvents = 5;

  const reversedEvents = useMemo(() => {
    return events.reverse().slice(0, numberOfLatestEvents);
  }, [events]);

  return (
    <>
      {reversedEvents.length === 0 ? (
        <EmptyLogs />
      ) : (
        <>
          <ul>
            {reversedEvents.map((event, index) => (
              <li
                key={index}
                className="text-muted-foreground space-y-2 flex flex-col gap-2"
              >
                <JsonView
                  data={event}
                  shouldExpandNode={allExpanded}
                  style={{
                    ...defaultStyles,
                    container: "rounded-md bg-gray-300/30 mt-2 py-2",
                    label: "text-gray-800 font-medium",
                  }}
                />
              </li>
            ))}
          </ul>
          <Spacer size="sm" />
          <AlertMessage
            variant="info"
            size="sm"
            message={`We only display the ${numberOfLatestEvents} latest events for performance reasons`}
          />
          <Spacer size="sm" />
        </>
      )}
    </>
  );
};

const FinalResult: FC<{ events: FlowResultStreamEvent[] }> = ({ events }) => {
  const agregatedResult = useMemo(() => {
    if (events.length === 0) {
      return null;
    }

    const result: { [key: string]: string } = {};

    events.forEach((event) => {
      const value = result[event.fieldName];
      if (!value) {
        result[event.fieldName] = event.value;
      } else {
        result[event.fieldName] += `${event.value}`;
      }
    });

    return result;
  }, [events]);

  return (
    <>
      {!!agregatedResult && (
        <JsonView
          data={agregatedResult}
          shouldExpandNode={allExpanded}
          style={{
            ...defaultStyles,
            container: "rounded-md bg-gray-300/30 mt-2 py-2",
            label: "text-gray-800 font-medium",
          }}
        />
      )}
      {!agregatedResult && <EmptyLogs />}
    </>
  );
};

const NodeInspector: FC = () => {
  const inspectingNode = getInspectingNode();

  if (!inspectingNode) {
    return (
      <p className="text-muted-foreground text-sm">
        Select a node to inspect once the flow is completed.
      </p>
    );
  }

  return (
    <div className="h-full w-full">
      {inspectingNode && (
        <div>
          <h1>Node input</h1>
          <JsonView
            data={inspectingNode.nodeInput as object | string | object[]}
            shouldExpandNode={allExpanded}
            style={{
              ...defaultStyles,
              container: "rounded-md bg-gray-300/30 mt-2 py-2",
              label: "text-gray-800 font-medium",
            }}
          />
          <Spacer size="sm" />
          <h1>Node output</h1>
          <JsonView
            data={inspectingNode.nodeOutput as object | string | object[]}
            shouldExpandNode={allExpanded}
            style={{
              ...defaultStyles,
              container: "rounded-md bg-gray-300/30 mt-2 py-2",
              label: "text-gray-800 font-medium",
            }}
          />
        </div>
      )}
    </div>
  );
};

const AgentNotifications: FC<{
  agentNotifications: {
    data: string;
    nodeId: string;
    nodeType: string;
    outputField: string;
  }[];
}> = ({ agentNotifications }) => {
  const numberOfLatestEvents = 10;
  const reversedEvents = useMemo(() => {
    return agentNotifications.reverse().slice(0, numberOfLatestEvents);
  }, [agentNotifications]);

  return (
    <>
      {reversedEvents.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No agent notifications available. Use the SDK notifier tool to allow
          your AI Agent send notifications to the SDK.
        </p>
      ) : (
        <>
          <ul>
            {reversedEvents.map((event, index) => (
              <li
                key={index}
                className="text-muted-foreground space-y-2 flex flex-col gap-2"
              >
                <JsonView
                  data={event}
                  shouldExpandNode={allExpanded}
                  style={{
                    ...defaultStyles,
                    container: "rounded-md bg-gray-300/30 mt-2 py-2",
                    label: "text-gray-800 font-medium",
                  }}
                />
              </li>
            ))}
          </ul>
          <Spacer size="sm" />
          <AlertMessage
            variant="info"
            size="sm"
            message={`We only display the ${numberOfLatestEvents} latest notifications for performance reasons`}
          />
          <Spacer size="sm" />
        </>
      )}
    </>
  );
};

export const TestFlowBottomPanel: FC<LogsPaneProps> = ({
  events,
  isRunning,
  flowId,
  inputs,
  flowError,
  agentNotifications,
}) => {
  const [activePane, setActivePane] = useState<
    | "full-result"
    | "source-code"
    | "logs"
    | "node-inspector"
    | "agent-notifications"
  >("full-result");

  const { id: projectId } = useCurrentProjectOrThrow();

  const flowInspectorStore = useCurrentFlowInspectorStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleUserScroll = () => {
      const isNearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 50;
      setIsAutoScroll(isNearBottom);
    };

    el.addEventListener("scroll", handleUserScroll);

    const resizeObserver = new ResizeObserver(() => {
      if (isAutoScroll) {
        el.scrollTop = el.scrollHeight;
      }
    });

    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", handleUserScroll);
      resizeObserver.disconnect();
    };
  }, [isAutoScroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && isAutoScroll) {
      el.scrollTop = el.scrollHeight;
    }
  }, [events, activePane, flowError, isRunning, isAutoScroll]);

  useEffect(() => {
    if (flowInspectorStore.inspectingNode) {
      setActivePane("node-inspector");
    }
  }, [flowInspectorStore]);

  return (
    <div className="bg-muted border-t flex flex-col max-h-full justify-start">
      <div className="pane-controls w-full flex justify-start gap-0 border-b items-center bg-gray-100 sticky top-0 z-10 shrink-0">
        <PaneButton
          active={activePane === "full-result"}
          onClick={() => setActivePane("full-result")}
          startContent={<BookCheck className="w-4 h-4" />}
        >
          Flow result
        </PaneButton>
        <PaneButton
          active={activePane === "logs"}
          onClick={() => setActivePane("logs")}
          startContent={<LogsIcon className="w-4 h-4" />}
        >
          Event streams
        </PaneButton>
        {/* <PaneButton
          active={activePane === "source-code"}
          onClick={() => setActivePane("source-code")}
          startContent={<BracesIcon className="w-4 h-4" />}
        >
          Integrate
        </PaneButton> */}
        <PaneButton
          active={activePane === "agent-notifications"}
          onClick={() => setActivePane("agent-notifications")}
          startContent={<MessageCircle className="w-4 h-4" />}
        >
          Notifications
        </PaneButton>
        <PaneButton
          active={activePane === "node-inspector"}
          onClick={() => setActivePane("node-inspector")}
          startContent={<Inspect className="w-4 h-4" />}
        >
          Inspect
        </PaneButton>
      </div>

      <div className="grow overflow-y-auto" ref={scrollRef}>
        {activePane === "full-result" && (
          <div className="p-4">
            {flowError && (
              <AlertMessage variant="danger" message={flowError}></AlertMessage>
            )}
            {isRunning && <Spinner />}
            <FinalResult events={events} />
          </div>
        )}

        {activePane === "logs" && (
          <div className="p-4">
            {isRunning && <Spinner />}
            <LogList events={events} />
          </div>
        )}

        {activePane === "agent-notifications" && (
          <div className="p-4">
            <AgentNotifications agentNotifications={agentNotifications} />
          </div>
        )}

        {activePane === "source-code" && (
          <div className="p-4">
            <SdkCodeExample
              projectId={projectId}
              secretKey={"<your-secret-key>"}
              flowId={flowId}
              inputs={inputs}
              showInitSdk={false}
            ></SdkCodeExample>
          </div>
        )}

        {activePane === "node-inspector" && (
          <div className="p-4">
            <NodeInspector></NodeInspector>
          </div>
        )}
      </div>
    </div>
  );
};
