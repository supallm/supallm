"use client";

import { EmptyState } from "@/components/empty-state";
import { LLMProviderCard } from "@/components/llm-providers/llm-provider-card";
import { ProviderCardList } from "@/components/llm-providers/provider-card-list";
import { ProviderLogo } from "@/components/logos/provider-logo";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { CardPageSkeleton } from "@/components/skeletons/card-page-skeleton";
import { PageContentCardListSkeleton } from "@/components/skeletons/page-content-card-list-skeleton";
import { PageContentCardSkeleton } from "@/components/skeletons/page-content-card-skeleton";
import { Spacer } from "@/components/spacer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppConfigStore } from "@/core/store/app-config";
import { useListLLMProviders } from "@/hooks/use-list-llm-providers";
import { PlusIcon } from "lucide-react";

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
  const { currentProject } = useAppConfigStore();

  if (!currentProject) {
    throw new Error("Unexpected error: no project id");
  }

  const { result: providers, isLoading } = useListLLMProviders(
    currentProject.id,
  );

  return (
    <div>
      <PageHeader
        title="LLMs providers"
        description="Welcome to your new project. Start by adding your first LLM provider."
      />
      <Spacer />
      <PageContainer>
        {isLoading && <PageSkeleton />}
        {!isLoading && !providers?.length && (
          <EmptyState
            title="No LLM providers"
            description="You don't have any LLM providers yet. Add one to start using them."
          >
            <Button startContent={<PlusIcon className="w-3 h-3" />}>
              Add LLM provider
            </Button>
          </EmptyState>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(providers).map(([key, value]) => (
            <LLMProviderCard
              key={key}
              name={value.name}
              description={value.description}
              logo={<ProviderLogo name={value.provider} />}
            />
          ))}
        </div>
      </PageContainer>
    </div>
  );
};

export default ProjectPage;
