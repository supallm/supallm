import { cn } from "@/lib/utils";
import { FC, ReactNode } from "react";
import { Card, CardContent, CardHeader } from "../../ui/card";

export type ChoiceProps = {
  name: string;
  description: string;
  logo: ReactNode;
  commingSoon: boolean;
  onSelected: () => void;
};

export const AddNodeDialogChoice: FC<ChoiceProps> = ({
  name,
  description,
  logo,
  commingSoon,
  onSelected,
}) => {
  return (
    <Card
      onClick={() => {
        if (commingSoon) return;
        onSelected();
      }}
      className={cn(
        "transition-all duration-400 cursor-pointer py-3 px-0",
        commingSoon
          ? "cursor-default bg-muted"
          : "hover:scale-102 hover:from-green-200 hover:via-white hover:to-green-100 hover:via-gray-100 hover:border-green-300 bg-gradient-to-bl from-green-50 via-white to-gray-50 hover:scale-101 ",
      )}
    >
      <CardHeader>
        <div className="flex flex-row gap-3 items-center py-0 px-0">
          {logo}
          <div>
            <h2 className="text-mg font-medium">{name}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardHeader>
      {commingSoon && (
        <CardContent className="flex flex-col items-center justify-center">
          <p className="text-sm text-gray-500">Coming Soon</p>
        </CardContent>
      )}
    </Card>
  );
};
