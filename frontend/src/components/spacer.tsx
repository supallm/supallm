import { cn } from "@/lib/utils";
import { FC } from "react";

export const Spacer: FC<{
  direction: "horizontal" | "vertical";
  size: "sm" | "md" | "lg";
}> = ({ direction, size }) => {
  const sizeClass = {
    sm: direction === "horizontal" ? "w-10" : "h-10",
    md: direction === "horizontal" ? "w-20" : "h-20",
    lg: direction === "horizontal" ? "w-30" : "h-30",
  };

  return <div className={cn("h-10", sizeClass[size])}></div>;
};
