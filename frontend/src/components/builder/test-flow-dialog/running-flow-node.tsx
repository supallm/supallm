import { BaseHandle } from "@/components/base-handle";
import { OpenAI } from "@/components/logos/openai";
import { ProviderLogo } from "@/components/logos/provider-logo";
import { cn } from "@/lib/utils";
import { NodeProps, Position } from "@xyflow/react";
import {
  Bot,
  Code,
  Database,
  Flag,
  FolderSymlink,
  UserCheck,
} from "lucide-react";
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

    case "chat-anthropic":
      return (
        <>
          <ProviderLogo name="anthropic" />
          <span className="font-medium text-sm">Chat Anthropic</span>
        </>
      );

    case "chat-mistral":
      return (
        <>
          <ProviderLogo name="mistral" />
          <span className="font-medium text-sm">Chat Mistral</span>
        </>
      );

    case "chat-ollama":
      return (
        <>
          <ProviderLogo name="ollama" />
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
        <>
          <Bot className="w-4 h-4" />
          <span className="font-medium text-sm">AI Agent</span>
        </>
      );

    case "model-openai":
      return (
        <>
          <OpenAI width={10} height={10} />
          <span className="font-medium text-sm">OpenAI Model</span>
        </>
      );

    case "chat-openai-as-tool":
      return (
        <>
          <OpenAI width={10} height={10} />
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
