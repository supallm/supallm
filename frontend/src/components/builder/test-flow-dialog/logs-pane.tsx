import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";
import { FC, useMemo, useState } from "react";
import { JsonView, allExpanded, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { FlowEventData } from "supallm";

interface LogsPaneProps {
  events: FlowEventData[];
  isRunning: boolean;
}

const PaneButton: FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 cursor-pointer hover:bg-gray-200 text-gray-800",
        active ? "bg-gray-200 font-medium" : "bg-gray-100",
      )}
    >
      {children}
    </button>
  );
};

const LogsPane: FC<LogsPaneProps> = ({ events, isRunning }) => {
  const [activePane, setActivePane] = useState<
    "full-result" | "source-code" | "logs"
  >("full-result");

  const reversedEvents = useMemo(() => {
    return [...events].reverse();
  }, [events]);

  const agregatedResult = useMemo(() => {
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
  }, [reversedEvents]);

  return (
    <div className="bg-muted grow border-t overflow-y-auto">
      <div className="pane-controls w-full flex justify-start gap-0 border-b items-center bg-gray-100">
        <PaneButton
          active={activePane === "full-result"}
          onClick={() => setActivePane("full-result")}
        >
          Full result
        </PaneButton>
        <PaneButton
          active={activePane === "logs"}
          onClick={() => setActivePane("logs")}
        >
          Event streams
        </PaneButton>
        <PaneButton
          active={activePane === "source-code"}
          onClick={() => setActivePane("source-code")}
        >
          Source Code
        </PaneButton>
      </div>

      {activePane === "full-result" && (
        <div className="p-4">
          {isRunning && <Spinner />}
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
        </div>
      )}

      {activePane === "logs" && (
        <div className="p-4">
          {isRunning && <Spinner />}

          {reversedEvents.length === 0 ? (
            <p className="text-muted-foreground">No logs available</p>
          ) : (
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
          )}
        </div>
      )}
    </div>
  );
};

export default LogsPane;
