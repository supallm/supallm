import { cn } from "@/lib/utils";
import { HandleProps } from "@xyflow/react";
import { forwardRef, HTMLAttributes, ReactNode } from "react";

import { BaseHandle } from "@/components/base-handle";
import { IconTooltip } from "@/components/icon-tooltip";

const flexDirections = {
  top: "flex-col",
  right: "justify-end",
  bottom: "flex-col-reverse justify-end",
  left: "flex-row",
};

export const LabeledHandle = forwardRef<
  HTMLDivElement,
  HandleProps &
    HTMLAttributes<HTMLDivElement> & {
      title: string;
      handleClassName?: string;
      labelClassName?: string;
      tooltip?: ReactNode;
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
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      title={title}
      className={cn(
        "relative flex items-center text-sm py-1.6",
        flexDirections[position],
        className,
      )}
    >
      <BaseHandle
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
        {!!tooltip && position === "right" && <IconTooltip content={tooltip} />}
        {title}
        {!!tooltip && position === "left" && <IconTooltip content={tooltip} />}
      </label>
    </div>
  ),
);

LabeledHandle.displayName = "LabeledHandle";
