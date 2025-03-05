import { FC } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export const TruncatedTableCell: FC<{
  value: string;
}> = ({ value }) => {
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
