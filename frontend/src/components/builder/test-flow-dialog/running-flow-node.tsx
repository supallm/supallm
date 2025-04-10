import { BaseHandle } from "@/components/base-handle";
import { OpenAI } from "@/components/logos/openai";
import { PostgresLogo } from "@/components/logos/postgres";
import { ProviderLogo } from "@/components/logos/provider-logo";
import { setInspectingNode } from "@/core/store/flow";
import { cn } from "@/lib/utils";
import { NodeProps, Position } from "@xyflow/react";
import {
  Bot,
  Code,
  Database,
  Flag,
  FolderSymlink,
  Inspect,
  MessageCircle,
  Network,
  UserCheck,
} from "lucide-react";
import { FC, memo } from "react";
import { NodeType } from "../node-types";
import { BaseNodeHeader } from "../nodes/common/base-node-header";

export type RunningFlowNodeProps = NodeProps & {
  data: {
    status: "idle" | "active" | "ended" | "failed";
    input: unknown;
    output: unknown;
    logs: unknown[];
    nodeData: Record<string, unknown>;
  };
  type: NodeType;
};

const NodeHeader: FC<{
  nodeType: NodeType;
  nodeData?: Record<string, unknown> | null;
}> = ({ nodeType }) => {
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

    case "chat-anthropic":
      return (
        <>
          <div className="shrink-0">
            <ProviderLogo name="anthropic" />
          </div>
          <span className="font-medium text-sm">Chat Anthropic</span>
        </>
      );

    case "chat-mistral":
      return (
        <>
          <div className="shrink-0">
            <ProviderLogo name="mistral" />
          </div>
          <span className="font-medium text-sm">Chat Mistral</span>
        </>
      );

    case "chat-ollama":
      return (
        <>
          <div className="shrink-0">
            <ProviderLogo name="ollama" />
          </div>
          <span className="font-medium text-sm">Chat Ollama</span>
        </>
      );

    case "result":
      return (
        <>
          <FolderSymlink className="w-4 h-4" />
          <span className="font-medium text-sm">Flow output</span>
        </>
      );

    case "ai-agent":
      return (
        <BaseNodeHeader title="AI Agent" logo={<Bot className="w-4 h-4" />} />
      );

    case "model-openai":
      return (
        <>
          <div className="shrink-0">
            <OpenAI width={10} height={10} />
          </div>
          <span className="font-medium text-sm">OpenAI Model</span>
        </>
      );

    case "chat-openai-as-tool":
      return (
        <>
          <div className="shrink-0">
            <OpenAI width={10} height={10} />
          </div>
          <span className="font-medium text-sm">OpenAI LLM as tool</span>
        </>
      );

    case "local-memory":
      return (
        <>
          <Database className="w-4 h-4" />
          <span className="font-medium text-sm">Local memory</span>
        </>
      );

    case "user-feedback":
      return (
        <>
          <UserCheck className="w-4 h-4" />
          <span className="font-medium text-sm">User feedback</span>
        </>
      );

    case "http-tool":
      return (
        <>
          <Network className="w-4 h-4" />
          <span className="font-medium text-sm">HTTP tool</span>
        </>
      );

    case "sdk-notifier-tool":
      return (
        <>
          <MessageCircle className="w-4 h-4" />
          <span className="font-medium text-sm">SDK notifier tool</span>
        </>
      );

    case "postgres-query-tool":
      return (
        <BaseNodeHeader
          title="Postgres query tool"
          logo={<PostgresLogo className="w-4 h-4" />}
        />
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
      ended: "border-green-500 shadow shadow-green-500 cursor-pointer",
      failed: "border-red-500 shadow shadow-red-500 cursor-pointer",
    };

  const statusClass = statusClasses[data.status];

  const isCompleted = data.status === "ended" || data.status === "failed";

  const handleInspectNode = () => {
    if (!isCompleted) return;
    setInspectingNode({
      nodeId,
      nodeInput: data.input,
      nodeOutput: data.output,
      nodeLogs: [],
    });
  };

  return (
    <button
      onClick={handleInspectNode}
      className={cn(
        "group rounded-xl p-0 gap-0 bg-white border transition-colors duration-500",
        statusClass,
      )}
      style={{ width: `${NODE_WIDTH}px` }}
    >
      <div className="flex flex-col items-center gap-2 py-2 px-3 justify-between">
        <div className="flex gap-2 items-center text-left">
          <NodeHeader nodeType={type} nodeData={data.nodeData} />
        </div>
        {isCompleted && (
          <div className="flex gap-1 text-xs group-hover:font-medium">
            click to inspect
            <Inspect className="w-4 h-4 text-gray-500" />
          </div>
        )}
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
    </button>
  );
};

export default memo(RunningFlowNode);
