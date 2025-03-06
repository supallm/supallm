import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { FC } from "react";
import { AlertDescription } from "./ui/alert";

export const AlertMessage: FC<{
  message: string | null;
  variant: "danger" | "info" | "warning";
}> = ({ message, variant }) => {
  if (!message) return null;

  const variantClasses = {
    danger: "bg-red-100 border-red-200 text-red-900",
    info: "bg-blue-100 border-blue-200 text-blue-900",
    warning: "bg-orange-100 border-orange-200 text-orange-900",
  };

  const variantTextClasses = {
    danger: "text-red-900",
    info: "text-blue-900",
    warning: "text-orange-900",
  };

  const iconMap = {
    danger: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const Icon = iconMap[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-start justify-center gap-2 rounded-md rounded-md p-4 border",
        variantClasses[variant],
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4 shrink-0", variantTextClasses[variant])} />
        <AlertDescription className={variantTextClasses[variant]}>
          {message}
        </AlertDescription>
      </div>
    </div>
  );
};
