import { cn } from "@/lib/utils";
import { FC, useState } from "react";
import { Button } from "./ui/button";

export const CopiableKey: FC<{
  value: string;
  width: "sm" | "md" | "full";
  size: "xs" | "sm" | "md";
  className?: string;
  isSecret?: boolean;
}> = ({ value, width = "sm", size = "xs", className, isSecret = false }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [revealed, setRevealed] = useState(!isSecret);

  const obfuscatedValue = "*** ".repeat(20);

  const widthClasses = {
    sm: "max-w-30",
    md: "max-w-50",
    full: "w-full",
  };

  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-md",
  };

  const widthClass = widthClasses[width];
  const sizeClass = sizeClasses[size];

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    } catch {
      //
    }
  };

  return (
    <div
      className={cn(
        "cursor-pointer border rounded-md flex items-center bg-gray-50 relative",
        widthClass,
        sizeClass,
        className,
      )}
    >
      <span className="truncate">{revealed ? value : obfuscatedValue}</span>
      <div className="absolute top-0 right-1 bottom-0 flex items-center justify-center">
        {!revealed && (
          <Button
            key="reveal"
            variant="outline"
            className="m-0"
            size="sm"
            onClick={() => setRevealed(true)}
          >
            Reveal
          </Button>
        )}
        {!!revealed && (
          <>
            {isCopied ? (
              <Button variant="outline" className="m-0" size="sm">
                Copied!
              </Button>
            ) : (
              <Button
                key="copy"
                variant="outline"
                className="m-0"
                size="sm"
                onClick={handleCopy}
              >
                Copy
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
