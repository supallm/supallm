import * as React from "react";

import { cn } from "@/lib/utils";

export type InputSize = "sm" | "md";

function Input({
  className,
  type,
  inputSize,
  ...props
}: React.ComponentProps<"input"> & { inputSize?: InputSize }) {
  const sizeClasses: Record<InputSize, string> = {
    sm: "h-7 rounded-sm",
    md: "h-9 rounded-md",
  };

  const sizeClass = sizeClasses[inputSize ?? "md"];

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        sizeClass,
        className,
      )}
      {...props}
    />
  );
}

export { Input };
