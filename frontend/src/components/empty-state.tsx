import { FC, PropsWithChildren } from "react";
import { Card, CardContent } from "./ui/card";

export const EmptyState: FC<
  PropsWithChildren<{
    title: string;
    description: string;
  }>
> = ({ title, description, children }) => {
  return (
    <Card className=" bg-gradient-to-b from-gray-50 to-gray-50 via-white">
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-lg font-medium">{title}</span>
          <span className="text-sm text-muted-foreground">{description}</span>
        </div>
        {children}
      </CardContent>
    </Card>
  );
};
