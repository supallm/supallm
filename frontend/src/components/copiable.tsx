import { ClipboardCheckIcon, ClipboardIcon } from "lucide-react";
import { Badge } from "./ui/badge";
import { FC, useState } from "react";

export const Copiable: FC<{ value: string }> = ({ value }) => {
  const [isCopied, setIsCopied] = useState(false);

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
    <Badge variant="outline" className="cursor-pointer" onClick={handleCopy}>
      {isCopied ? (
        <ClipboardCheckIcon className="h-4 w-4" />
      ) : (
        <ClipboardIcon className="h-4 w-4" />
      )}
      {value}
    </Badge>
  );
};
