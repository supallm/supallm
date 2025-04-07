import { X } from "lucide-react";
import { FC } from "react";
import { Button } from "./ui/button";

export const Chip: FC<{
  children: React.ReactNode;
  variant?: "outline" | "solid";
  size?: "sm" | "md" | "lg";
  closable?: boolean;
}> = ({ children, variant = "outline", size = "md", closable = false }) => {
  return (
    <div className="px-2 py-1 rounded-sm bg-gray-100 text-xs text-gray-800 gap-2">
      {children}
      {closable && <Button size="sm" variant="icon" startContent={<X />} />}
    </div>
  );
};
