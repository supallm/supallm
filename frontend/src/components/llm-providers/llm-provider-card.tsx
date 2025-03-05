import { LLMProvider, LLMProviderLabel } from "@/core/entities/llm-provider";
import { FC } from "react";
import { ProviderLogo } from "../logos/provider-logo";
import { Button } from "../ui/button";
import { Card, CardFooter, CardHeader } from "../ui/card";

import { deleteLLMProviderUsecase } from "@/core/usecases";
import { hookifyFunction } from "@/hooks/hookify-function";
import { Cog, Trash2 } from "lucide-react";
import { ConfirmDangerDialog } from "../confirm-danger-dialog";
import { EditLLMProviderDialog } from "../edit-llm-provider-dialog";

export type LLMProviderCardProps = {
  provider: LLMProvider;
  onEdit: () => void;
};

export const LLMProviderCard: FC<LLMProviderCardProps> = ({ provider }) => {
  const type = provider.providerType;
  const name = provider.name;

  const { execute: deleteLLMProvider, isLoading: deleteLLMProviderLoading } =
    hookifyFunction(
      deleteLLMProviderUsecase.execute.bind(deleteLLMProviderUsecase),
    );

  const handleDelete = async () => {
    await deleteLLMProvider(provider.id);
  };

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
              onConfirm={handleDelete}
              confirmationText="DELETE"
            >
              <Button
                size="xs"
                variant="outline"
                isLoading={deleteLLMProviderLoading}
              >
                <Trash2 className="text-muted-foreground w-4 h-4" />
              </Button>
            </ConfirmDangerDialog>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
