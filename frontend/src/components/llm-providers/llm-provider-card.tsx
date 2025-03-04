import { FC, ReactNode } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  LLMProvider,
  LLMProviderLabel,
  LLMProviderName,
} from "@/core/entities/llm-provider";
import { ProviderLogo } from "../logos/provider-logo";

import { Cog, EllipsisIcon, Trash, Trash2 } from "lucide-react";
import { ConfirmDangerDialog } from "../confirm-danger-dialog";
import { TriggerConfirmButton } from "../trigger-confirm-button";
import { ConfirmDialog } from "../confirm-dialog";
import { EditLLMProviderDialog } from "../edit-llm-provider-dialog";

export type LLMProviderCardProps = {
  provider: LLMProvider;
  onEdit: () => void;
};

export const LLMProviderCard: FC<LLMProviderCardProps> = ({
  provider,
  onEdit,
}) => {
  const type = provider.providerType;
  const name = provider.name;

  return (
    <Card className="bg-gradient-to-bl from-green-50 via-white to-gray-50 hover:scale-101 transition-all duration-300 cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex flex-row gap-2 items-center">
            <ProviderLogo name={type} width={30} height={30} />
            <h2 className="text-lg font-medium">{name}</h2>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Configured with {LLMProviderLabel(type)}
          </p>
        </div>
      </CardHeader>
      <CardFooter>
        <div className="flex flex-row justify-between w-full">
          <div className="flex flex-row gap-2 items-center">
            <EditLLMProviderDialog provider={provider}>
              <Button size="xs" variant="outline">
                <Cog className="text-muted-foreground w-4 h-4" /> Edit
              </Button>
            </EditLLMProviderDialog>

            <ConfirmDangerDialog
              title="Are you sure?"
              description="This action will remove the provider and all related models resulting in a potential downtime of your application."
              onConfirm={() => {}}
              confirmationText="DELETE"
            >
              <TriggerConfirmButton size="xs" variant="outline">
                <Trash2 className="text-muted-foreground w-4 h-4" />
              </TriggerConfirmButton>
            </ConfirmDangerDialog>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
