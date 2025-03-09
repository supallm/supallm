import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { FC } from "react";

interface IconTooltipProps {
  content: string;
}

export const IconTooltip: FC<IconTooltipProps> = ({ content }) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Info className="w-4 h-4" />
      </TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  );
};
