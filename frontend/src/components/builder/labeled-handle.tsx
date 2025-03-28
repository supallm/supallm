import { assertUnreachable, cn } from "@/lib/utils";
import { HandleProps, useNodeConnections } from "@xyflow/react";
import { FC, forwardRef, HTMLAttributes, ReactNode, useMemo } from "react";

import { BaseHandle } from "@/components/base-handle";
import { TooltipWraper } from "@/components/icon-tooltip";
import {
  AlignJustify,
  Braces,
  BrainCircuit,
  Database,
  HandHelping,
  ImageIcon,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const flexDirections = {
  top: "flex-col",
  right: "justify-end",
  bottom: "flex-col-reverse justify-end",
  left: "flex-row",
};

export type LabeledHandleType =
  | "image"
  | "text"
  | "any"
  | "memory"
  | "ai-model"
  | "handoffs"
  | "tools"
  | "guardrails";

const HandleTypeIcon: FC<{ type: LabeledHandleType }> = ({
  type,
}): ReactNode => {
  switch (type) {
    case "image":
      return <ImageIcon className="w-4 h-4" />;
    case "text":
      return <AlignJustify className="w-4 h-4" />;
    case "any":
      return <Braces className="w-4 h-4" />;
    case "memory":
      return <Database className="w-4 h-4" />;
    case "ai-model":
      return <BrainCircuit className="w-4 h-4" />;
    case "handoffs":
      return <HandHelping className="w-4 h-4" />;
    case "tools":
      return <Wrench className="w-4 h-4" />;
    case "guardrails":
      return <ShieldCheck className="w-4 h-4" />;
    default:
      assertUnreachable(type);
  }
};

export const LabeledHandle = forwardRef<
  HTMLDivElement,
  HandleProps &
    HTMLAttributes<HTMLDivElement> & {
      title: string;
      handleClassName?: string;
      labelClassName?: string;
      tooltip?: ReactNode;
      handleType: LabeledHandleType;
    }
>(
  (
    {
      className,
      labelClassName,
      handleClassName,
      title,
      position,
      tooltip,
      handleType,
      ...props
    },
    ref,
  ) => {
    const connections = useNodeConnections();

    /**
     * If this handle is already used as a targetHandle it means we shouldn't connect it twice.
     */
    const isConnectable = useMemo(() => {
      if (!connections) return true;

      const targetHandle = connections.find((c) => c.sourceHandle === props.id);

      if (!targetHandle) return true;

      return false;
    }, [connections, props.id]);

    return (
      <div
        ref={ref}
        title={title}
        className={cn(
          "relative flex items-center text-sm py-1.6",
          flexDirections[position],
          className,
        )}
      >
        <TooltipWraper content={tooltip}>
          <BaseHandle
            isConnectableEnd={isConnectable}
            position={position}
            className={cn("!w-2.5 !h-2.5 !bg-gray-400", handleClassName)}
            {...props}
          />

          <label
            className={cn(
              "px-3 text-foreground flex items-center gap-x-1",
              labelClassName,
            )}
          >
            {position === "left" && (
              <>
                <HandleTypeIcon type={handleType} />
              </>
            )}
            {title}

            {position === "right" && (
              <>
                <HandleTypeIcon type={handleType} />
              </>
            )}
          </label>
        </TooltipWraper>
      </div>
    );
  },
);

LabeledHandle.displayName = "LabeledHandle";
