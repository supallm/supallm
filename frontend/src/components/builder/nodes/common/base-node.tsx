import { cn } from "@/lib/utils";
import {
  Edge,
  getConnectedEdges,
  Position,
  useReactFlow,
  useUpdateNodeInternals,
} from "@xyflow/react";
import {
  FC,
  memo,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { NODE_WIDTH } from "../../constants";
import { LabeledHandle } from "../../labeled-handle";

export type BaseNodeHandleType =
  | "text"
  | "image"
  | "any"
  | "memory"
  | "ai-model"
  | "handoffs"
  | "tools"
  | "guardrails";

export type BaseNodeHandle = {
  /**
   * Name displayed in the node
   */
  label: string;
  /**
   * Name of the handle used in the node data flow
   */
  id: string;
  tooltip?: string | ReactNode;
  type: BaseNodeHandleType;
  position?: Position;
};

export type BaseNodeProps = {
  nodeId: string;
  header: ReactNode;
  configHandles?: BaseNodeHandle[];
  inputHandles: BaseNodeHandle[];
  outputHandles: BaseNodeHandle[];
  capabilityHandles?: BaseNodeHandle[];
  outputLabel?: string;
  noLabel?: boolean;
};

const BaseNode: FC<PropsWithChildren<BaseNodeProps>> = ({
  nodeId,
  children,
  header,
  configHandles = [],
  capabilityHandles = [],
  inputHandles,
  outputHandles,
  outputLabel = "Output",
  noLabel = false,
}) => {
  const updateNodeInternals = useUpdateNodeInternals();

  const { getEdges, deleteElements } = useReactFlow();
  const [active, setActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setActive(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  /**
   * See:
   * https://reactflow.dev/api-reference/hooks/use-update-node-internals
   */
  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [nodeId, updateNodeInternals, inputHandles, outputHandles, configHandles]);

  useEffect(() => {
    updateNodeInternals(nodeId);

    const ingoingEdges = getConnectedEdges(
      // @ts-expect-error - this is the right type
      [{ id: nodeId }],
      getEdges(),
    ).filter((e) => {
      return e.source === nodeId;
    });

    const outgoingEdges = getConnectedEdges(
      // @ts-expect-error - this is the right type
      [{ id: nodeId }],
      getEdges(),
    ).filter((e) => {
      return e.target === nodeId;
    });

    const ghostEdges: Edge[] = [];

    // Important:
    // We consider a config edge and an input edge as an ingoing edge.
    ingoingEdges.forEach((edge) => {
      const isGhostEdge =
        !inputHandles.find((input) => input.id === edge.sourceHandle) &&
        !configHandles.find((config) => config.id === edge.sourceHandle) &&
        !capabilityHandles.find(
          (capability) => capability.id === edge.sourceHandle,
        );

      console.log("isGhostEdge", isGhostEdge, edge);

      if (isGhostEdge) {
        ghostEdges.push(edge);
      }
    });

    // Important:
    // We consider a capability edge and an output edge as an outgoing edge.
    outgoingEdges.forEach((edge) => {
      const isGhostEdge =
        !outputHandles.find((output) => output.id === edge.targetHandle) &&
        !capabilityHandles.find(
          (capability) => capability.id === edge.targetHandle,
        );

      if (isGhostEdge) {
        ghostEdges.push(edge);
      }
    });

    deleteElements({ edges: ghostEdges });
  }, [
    nodeId,
    inputHandles,
    updateNodeInternals,
    outputHandles,
    deleteElements,
    getEdges,
  ]);

  return (
    <div
      className={cn(
        "rounded-xl p-0 gap-0 bg-white border transition-colors duration-500",
        active ? "border-green-500 shadow shadow-green-500" : "border-gray-300",
      )}
      style={{ width: `${NODE_WIDTH}px` }}
    >
      <div className="flex flex-row items-center border-b gap-2 py-2 px-3">
        {header}
      </div>
      {!!inputHandles.length && (
        <>
          <div className="flex flex-col gap-2 text-center py-1 bg-gray-50 border-b text-sm">
            Inputs
          </div>

          <div className="py-3">
            {inputHandles.map((handle, index) => (
              <LabeledHandle
                key={`input-${handle.id}-${index}`}
                title={handle.label}
                type="source"
                id={handle.id}
                handleType={handle.type}
                tooltip={handle.tooltip}
                position={handle.position ?? Position.Left}
              />
            ))}
          </div>
        </>
      )}
      {!!configHandles?.length && (
        <>
          <div className="flex flex-col gap-2 text-center py-1 bg-gray-50 border-y text-sm">
            Configuration
          </div>

          <div className="py-3">
            {configHandles.map((handle, index) => (
              <LabeledHandle
                key={`input-${handle.id}-${index}`}
                title={handle.label}
                type="source"
                id={handle.id}
                handleType={handle.type}
                tooltip={handle.tooltip}
                position={handle.position ?? Position.Left}
              />
            ))}
          </div>
        </>
      )}
      {!!children && <div className="p-3">{children}</div>}
      {!!capabilityHandles?.length && (
        <>
          <div className="flex flex-col gap-2 text-center py-1 bg-gray-50 border-y text-sm">
            Capabilities
          </div>

          <div className="py-3">
            {capabilityHandles.map((handle, index) => (
              <LabeledHandle
                key={`input-${handle.id}-${index}`}
                title={handle.label}
                type="target"
                id={handle.id}
                handleType={handle.type}
                tooltip={handle.tooltip}
                position={handle.position ?? Position.Right}
              />
            ))}
          </div>
        </>
      )}
      {!!outputHandles.length && (
        <>
          {!noLabel && (
            <div className="flex flex-col gap-2 text-center py-1 bg-gray-50 border-y text-sm">
              {outputLabel}
            </div>
          )}
          <div className="flex flex-col gap-2 text-center py-3 bg-gray-50 rounded-b-xl">
            {outputHandles.map((handle, index) => (
              <LabeledHandle
                key={`output-${handle.id}-${index}`}
                title={handle.label}
                type="target"
                id={handle.id}
                handleType={handle.type}
                tooltip={handle.tooltip}
                position={handle.position ?? Position.Right}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default memo(BaseNode);
