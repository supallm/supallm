import { FC, ReactNode } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  LLMProviderLabel,
  LLMProviderName,
} from "@/core/entities/llm-provider";
import { ProviderLogo } from "../logos/provider-logo";

export type LLMProviderCardProps = {
  providerType: LLMProviderName;
  name: string;
  onEdit: () => void;
};

export const LLMProviderCard: FC<LLMProviderCardProps> = ({
  providerType,
  name,
  onEdit,
}) => {
  return (
    <Card
      className={cn(
        "bg-gradient-to-bl from-green-50 via-white to-gray-50 hover:scale-101 transition-all duration-300 cursor-pointer",
      )}
    >
      <CardHeader>
        <div className="flex flex-row gap-2 items-center">
          <ProviderLogo name={providerType} width={30} height={30} />
          <h2 className="text-lg font-medium">{name}</h2>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Configured with {LLMProviderLabel(providerType)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <Button variant={"outline"} className="w-full" onClick={onEdit}>
          Edit
        </Button>
      </CardContent>
    </Card>
  );
};
