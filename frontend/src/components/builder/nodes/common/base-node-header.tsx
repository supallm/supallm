import { FC } from "react";

export const BaseNodeHeader: FC<{
  title: string;
  logo: React.ReactNode;
  subtitle?: string | null;
}> = ({ title, logo, subtitle }) => {
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-center gap-2">
        {logo}
        <span className="font-medium text-sm">{title}</span>
      </div>
      {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
    </div>
  );
};
