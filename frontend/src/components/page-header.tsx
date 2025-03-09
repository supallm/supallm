import { cn } from "@/lib/utils";
import { FC } from "react";
import { Skeleton } from "./ui/skeleton";

export const PageHeader: FC<{
  title: string;
  description?: string;
  noBorder?: boolean;
  actions?: React.ReactNode;
  actionsLoading?: boolean;
}> = ({ title, description, noBorder, actions, actionsLoading }) => {
  return (
    <div
      className={cn(
        "min-h-[100px] items-center flex w-full",
        noBorder ? "border-b-0" : "border-b",
      )}
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-14 xl:px-24 2xl:px-28 flex justify-between">
        <div>
          <h1 className="text-2xl font-medium">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {!!actionsLoading && <Skeleton className="w-24 h-8" />}
        {!actionsLoading && !!actions && <div>{actions}</div>}
      </div>
    </div>
  );
};
