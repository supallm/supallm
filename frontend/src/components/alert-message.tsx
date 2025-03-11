import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { AlertDescription } from "./ui/alert";

export const AlertMessage: FC<{
  message: string | null;
  variant: "danger" | "info" | "warning" | "success";
  durationMs?: number;
  size?: "sm" | "md";
}> = ({ message, variant, durationMs = -1, size = "md" }) => {
  const [showMessage, setShowMessage] = useState(true);

  useEffect(() => {
    if (durationMs > 0) {
      setTimeout(() => {
        setShowMessage(false);
      }, durationMs);
    }
  }, [durationMs]);

  if (!message) return null;

  if (!showMessage) return null;

  const sizeClasses = {
    sm: "p-2",
    md: "p-4",
  };

  const variantClasses = {
    danger: "bg-red-100 border-red-200 text-red-900",
    info: "bg-blue-100 border-blue-200 text-blue-900",
    warning: "bg-orange-100 border-orange-200 text-orange-900",
    success: "bg-green-100 border-green-200 text-green-900",
  };

  const variantTextClasses = {
    danger: "text-red-900",
    info: "text-blue-900",
    warning: "text-orange-900",
    success: "text-green-900",
  };

  const iconMap = {
    danger: AlertCircle,
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
  };

  const Icon = iconMap[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-start justify-center gap-2 rounded-md rounded-md border w-full",
        variantClasses[variant],
        sizeClasses[size],
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
