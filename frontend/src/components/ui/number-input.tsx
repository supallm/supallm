import * as React from "react";

import { cn } from "@/lib/utils";
import { CircleX } from "lucide-react";
import { Button } from "./button";

function NumberInput({
  className,
  value = undefined,
  onChange,
  clearable = false,
  ...props
}: React.ComponentProps<"input"> & {
  value?: number | undefined;
  onChange: (value: number | undefined) => void;
  clearable?: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue === "" ? (clearable ? undefined : 0) : Number(newValue));
  };

  const handleClear = () => {
    onChange(undefined);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="number"
        value={value !== undefined ? value : ""}
        onChange={handleInputChange}
        data-slot="input"
        className={cn(
          "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance:textfield]",
          className,
        )}
        {...props}
        step="any"
      />
      {value !== undefined && (
        <Button
          variant="icon"
          size="xs"
          type="button"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          onClick={handleClear}
        >
          <CircleX className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

export { NumberInput };
