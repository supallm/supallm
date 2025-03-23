import { BaseHandle } from "@/components/base-handle";
import { OpenAI } from "@/components/logos/openai";
import { cn } from "@/lib/utils";
import { NodeProps, Position } from "@xyflow/react";
import { Code, Flag, FolderSymlink } from "lucide-react";
import { FC, memo } from "react";
import { NodeType } from "../node-types";

export type RunningFlowNodeProps = NodeProps & {
  data: {
    status: "idle" | "active" | "ended" | "failed";
  };
  type: NodeType;
};

const NodeHeader: FC<{ nodeType: NodeType }> = ({ nodeType }) => {
  switch (nodeType) {
    case "code-executor":
      return (
        <>
          <Code width={10} height={10} />
          <span className="font-medium text-sm">Code executor</span>
        </>
      );

    case "chat-openai":
      return (
        <>
          <OpenAI width={10} height={10} />
          <span className="font-medium text-sm">Chat OpenAI</span>
        </>
      );

    case "entrypoint":
      return (
        <>
          <Flag className="w-4 h-4" />
          <span className="font-medium text-sm">Flow input</span>
        </>
      );

    case "result":
      return (
        <>
          <FolderSymlink className="w-4 h-4" />
          <span className="font-medium text-sm">Flow output</span>
        </>
      );

    default:
      return null;
  }
};

export const RunningFlowNode: FC<RunningFlowNodeProps> = ({
  data,
  type,
  id: nodeId,
}) => {
  const NODE_WIDTH = 200;

  const statusClasses: Record<RunningFlowNodeProps["data"]["status"], string> =
    {
      idle: "border-gray-300",
      active:
        "border-indigo-300 shadow shadow-indigo-300 animate-shadow-pulse-indigo",
      ended: "border-green-500 shadow shadow-green-500",
      failed: "border-red-500 shadow shadow-red-500",
    };

  const statusClass = statusClasses[data.status];

  return (
    <div
      className={cn(
        "rounded-xl p-0 gap-0 bg-white border transition-colors duration-500",
        statusClass,
      )}
      style={{ width: `${NODE_WIDTH}px` }}
    >
      <div className="flex flex-row items-center gap-2 py-2 px-3">
        <NodeHeader nodeType={type} />
      </div>

      <BaseHandle
        position={Position.Top}
        className={cn("!w-2.5 !h-2.5 !bg-gray-400")}
        type="source"
        id={`${nodeId}-top`}
      />

      <BaseHandle
        position={Position.Bottom}
        className={cn("!w-2.5 !h-2.5 !bg-gray-400")}
        type="target"
        id={`${nodeId}-bottom`}
      />
    </div>
  );
};

export default memo(RunningFlowNode);
