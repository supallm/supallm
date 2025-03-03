import { cn } from "@/lib/utils";
import { FC } from "react";

export const PageHeader: FC<{
  title: string;
  description?: string;
  noBorder?: boolean;
}> = ({ title, description, noBorder }) => {
  return (
    <div
      className={cn(
        "min-h-[100px] items-center flex w-full",
        noBorder ? "border-b-0" : "border-b",
      )}
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-14 xl:px-24 2xl:px-28">
        <h1 className="text-2xl pb-3 font-medium">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};
