import { FC, ReactNode } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { ProviderLogo } from "../logos/provider-logo";

export type LLMProviderCardProps = {
  name: string;
  description: string;
  logo: ReactNode;
};

export const LLMProviderCard: FC<LLMProviderCardProps> = ({
  name,
  description,
  logo,
}) => {
  return (
    <Card className="bg-gradient-to-bl from-green-50 via-white to-gray-50 hover:scale-101 transition-all duration-300 cursor-pointer">
      <CardHeader>
        <div className="flex flex-row gap-2 items-center">
          {logo}
          <h2 className="text-lg font-medium">{name}</h2>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center"></CardContent>
    </Card>
  );
};
