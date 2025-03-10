import { cn } from "@/lib/utils";
import { ClipboardCheckIcon, ClipboardIcon } from "lucide-react";
import { FC, useState } from "react";

export const Copiable: FC<{
  value: string;
  width: "sm" | "md" | "full";
  size: "xs" | "sm" | "md";
}> = ({ value, width = "sm", size = "xs" }) => {
  const [isCopied, setIsCopied] = useState(false);

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
        "cursor-pointer border rounded-md flex items-center gap-1",
        widthClass,
        sizeClass,
      )}
      onClick={handleCopy}
    >
      {isCopied ? (
        <ClipboardCheckIcon className="h-3 w-3 shrink-0" />
      ) : (
        <ClipboardIcon className="h-3 w-3 shrink-0" />
      )}
      <span className="truncate">{value}</span>
    </div>
  );
};
