import { AlertMessage } from "@/components/alert-message";
import { SdkCodeExample } from "@/components/sdk-code-example";
import { Spacer } from "@/components/spacer";
import { Spinner } from "@/components/spinner";
import { EntrypointNodeData } from "@/core/entities/flow/flow-entrypoint";
import { ResultNodeData } from "@/core/entities/flow/flow-result";
import { useCurrentProjectOrThrow } from "@/hooks/use-current-project-or-throw";
import { cn } from "@/lib/utils";
import { BookCheck, BracesIcon, LogsIcon } from "lucide-react";
import { FC, useMemo, useState } from "react";
import { JsonView, allExpanded, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { FlowEventData } from "supallm";

interface LogsPaneProps {
  events: FlowEventData[];
  isRunning: boolean;
  entrypointNodeData: EntrypointNodeData | undefined;
  resultNodeData: ResultNodeData | undefined;
  flowId: string;
  inputs: { label: string; value: string }[];
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

const LogList: FC<{ events: FlowEventData[] }> = ({ events }) => {
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

const FinalResult: FC<{ events: FlowEventData[] }> = ({ events }) => {
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

export const TestFlowBottomPanel: FC<LogsPaneProps> = ({
  events,
  isRunning,
  entrypointNodeData,
  resultNodeData,
  flowId,
  inputs,
}) => {
  const [activePane, setActivePane] = useState<
    "full-result" | "source-code" | "logs"
  >("full-result");

  const { id: projectId } = useCurrentProjectOrThrow();

  return (
    <div className="bg-muted grow border-t overflow-y-auto">
      <div className="pane-controls w-full flex justify-start gap-0 border-b items-center bg-gray-100">
        <PaneButton
          active={activePane === "full-result"}
          onClick={() => setActivePane("full-result")}
          startContent={<BookCheck className="w-4 h-4" />}
        >
          Full result
        </PaneButton>
        <PaneButton
          active={activePane === "logs"}
          onClick={() => setActivePane("logs")}
          startContent={<LogsIcon className="w-4 h-4" />}
        >
          Event streams
        </PaneButton>
        <PaneButton
          active={activePane === "source-code"}
          onClick={() => setActivePane("source-code")}
          startContent={<BracesIcon className="w-4 h-4" />}
        >
          Integrate
        </PaneButton>
      </div>

      {activePane === "full-result" && (
        <div className="p-4">
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
    </div>
  );
};
