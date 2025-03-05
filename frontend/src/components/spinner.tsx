import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { FC } from "react";

export const Spinner: FC<{
  className?: string;
}> = ({ className }) => {
  return <Loader2 className={cn("size-4 animate-spin", className)} />;
};
