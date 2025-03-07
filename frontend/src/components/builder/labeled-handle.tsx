import { cn } from "@/lib/utils";
import { HandleProps } from "@xyflow/react";
import { forwardRef, HTMLAttributes } from "react";

import { BaseHandle } from "@/components/base-handle";

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
    }
>(
  (
    { className, labelClassName, handleClassName, title, position, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      title={title}
      className={cn(
        "relative flex items-center text-sm py-2",
        flexDirections[position],
        className,
      )}
    >
      <BaseHandle
        position={position}
        className={cn("!w-2.5 !h-2.5 !bg-gray-400", handleClassName)}
        {...props}
      />
      <label className={cn("px-3 text-foreground", labelClassName)}>
        {title}
      </label>
    </div>
  ),
);

LabeledHandle.displayName = "LabeledHandle";
