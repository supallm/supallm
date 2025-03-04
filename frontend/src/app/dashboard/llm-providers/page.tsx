"use client";

import { AddLLMProviderDialog } from "@/components/add-llm-provider-dialog";
import { EmptyState } from "@/components/empty-state";
import { LLMProviderCard } from "@/components/llm-providers/llm-provider-card";
import { ProviderLogo } from "@/components/logos/provider-logo";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { Spacer } from "@/components/spacer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppConfigStore } from "@/core/store/app-config";
import { useLLMProviderStore } from "@/core/store/llm-providers";
import { useListLLMProviders } from "@/hooks/use-list-llm-providers";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

export const PageSkeleton = () => {
  return (
    <div className="">
      <PageContainer>
        <div className="flex justify-end">
          <Button disabled startContent={<PlusIcon className="w-3 h-3" />}>
            Add LLM provider
          </Button>
        </div>
        <Spacer />
        <div className="space-y-4 w-full flex flex-col grow">
          <Skeleton className="h-[125px] w-fill rounded-xl" />
          <Skeleton className="h-[125px] w-fill rounded-xl" />
        </div>
      </PageContainer>
    </div>
  );
};

const ProjectPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { currentProject } = useAppConfigStore();
  const { llmProviders } = useLLMProviderStore();

  if (!currentProject) {
    throw new Error("Unexpected error: no project id");
  }

  const { isLoading } = useListLLMProviders(currentProject.id);

  const addLLMProviderButton = (
    <Button
      onClick={() => setIsDialogOpen(true)}
      startContent={<PlusIcon className="w-3 h-3" />}
    >
      Add LLM provider
    </Button>
  );

  return (
    <div>
      <AddLLMProviderDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
      <PageHeader title="LLMs providers" />
      <Spacer />
      <PageContainer>
        {isLoading && <PageSkeleton />}
        {!isLoading && !llmProviders?.length && (
          <EmptyState
            title="No LLM providers"
            description="You don't have any LLM providers yet. Add one to start using them."
          >
            {addLLMProviderButton}
          </EmptyState>
        )}

        {!isLoading && !!llmProviders?.length && (
          <div>
            <div className="flex justify-end">{addLLMProviderButton}</div>
            <Spacer />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(llmProviders).map(([key, value]) => (
                <LLMProviderCard onEdit={() => {}} key={key} provider={value} />
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default ProjectPage;
