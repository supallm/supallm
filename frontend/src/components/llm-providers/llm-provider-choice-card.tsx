import { FC, ReactNode } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export type LLMProviderChoiceCardProps = {
  name: string;
  description: string;
  logo: ReactNode;
  commingSoon: boolean;
  onSelected: () => void;
};

export const LLMProviderChoiceCard: FC<LLMProviderChoiceCardProps> = ({
  name,
  description,
  logo,
  commingSoon,
  onSelected,
}) => {
  return (
    <Card
      className={cn(
        "bg-gradient-to-bl from-green-50 via-white to-gray-50 hover:scale-101 transition-all duration-300 cursor-pointer",
        commingSoon ? "opacity-50 cursor-default" : "",
      )}
    >
      <CardHeader>
        <div className="flex flex-row gap-2 items-center">
          {logo}
          <h2 className="text-lg font-medium">{name}</h2>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        {commingSoon && (
          <p className="text-sm text-muted-foreground">Coming Soon</p>
        )}
        {!commingSoon && (
          <Button variant={"outline"} className="w-full" onClick={onSelected}>
            Select
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
