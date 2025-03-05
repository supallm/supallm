import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./ui/tooltip";
import { FC } from "react";

export const TruncatedTableCell: FC<{
  value: string;
  maxWidth?: number;
  tooltipMaxHeight?: number;
  tooltipMaxWidth?: number;
}> = ({
  value,
  maxWidth = 40,
  tooltipMaxHeight = 100,
  tooltipMaxWidth = 100,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="max-w-40 truncate">{value}</div>
        </TooltipTrigger>
        <TooltipContent className="max-w-100 max-h-100 truncate">
          <p>{value}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
