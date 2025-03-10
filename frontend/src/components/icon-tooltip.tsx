import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { FC, PropsWithChildren, ReactNode } from "react";

interface IconTooltipProps {
  content: string;
}

export const TooltipWraper: FC<PropsWithChildren<{ content: ReactNode }>> = ({
  children,
  content,
}) => {
  return (
    <Tooltip delayDuration={600}>
      <TooltipTrigger>{children}</TooltipTrigger>
      {!!content && (
        <TooltipContent className="text-sm">{content}</TooltipContent>
      )}
    </Tooltip>
  );
};

export const IconTooltip: FC<IconTooltipProps> = ({ content }) => {
  return (
    <TooltipWraper content={content}>
      <Info className="w-4 h-4" />
    </TooltipWraper>
  );
};
