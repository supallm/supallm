import { ClipboardCheckIcon, ClipboardIcon } from "lucide-react";
import { FC, useState } from "react";
import { cn } from "@/lib/utils";

export const Copiable: FC<{ value: string; width: "sm" | "md" | "full" }> = ({
  value,
  width = "sm",
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const widthClasses = {
    sm: "max-w-30",
    md: "max-w-50",
    full: "w-full",
  };

  const widthClass = widthClasses[width];

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
        "cursor-pointer px-2 py-1 border rounded-md flex items-center gap-1 text-xs",
        widthClass,
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
