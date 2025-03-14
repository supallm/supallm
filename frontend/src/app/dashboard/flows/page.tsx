"use client";

import { EmptyState } from "@/components/empty-state";
import { FlowCard } from "@/components/flow-card/flow-card";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { Spacer } from "@/components/spacer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlowStore } from "@/core/store/flow";
import { createFlowUsecase } from "@/core/usecases";
import { hookifyFunction } from "@/hooks/hookify-function";
import { useCurrentProjectOrThrow } from "@/hooks/use-current-project-or-throw";
import { useListFlows } from "@/hooks/use-list-flows";
import { FlowBuilderRoute } from "@/routes";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const PageSkeleton = () => {
  return (
    <div className="">
      <PageContainer>
        <div className="space-y-4 w-full flex flex-col grow">
          <Skeleton className="h-[125px] w-fill rounded-xl" />
          <Skeleton className="h-[125px] w-fill rounded-xl" />
        </div>
      </PageContainer>
    </div>
  );
};

const Page = () => {
  const currentProject = useCurrentProjectOrThrow();
  const { list: flows } = useFlowStore();
  const router = useRouter();

  const { isLoading: isCreating, execute: createFlow } = hookifyFunction(
    createFlowUsecase.execute.bind(createFlowUsecase),
  );

  const { isLoading } = useListFlows(currentProject.id);

  const handleAddFlow = async () => {
    try {
      const newFlow = await createFlow({
        projectId: currentProject.id,
      });
      router.push(FlowBuilderRoute.path(newFlow.id));
    } catch (error) {
      console.error("Failed to create flow:", error);
    }
  };

  const addFlowButton = (
    <Button
      onClick={handleAddFlow}
      startContent={<PlusIcon className="w-3 h-3" />}
      isLoading={isCreating}
    >
      Add flow
    </Button>
  );

  return (
    <div>
      {/* <AddFlowDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} /> */}
      <PageHeader
        title="Flows"
        actions={addFlowButton}
        actionsLoading={isLoading}
      />
      <Spacer />
      <PageContainer>
        {isLoading && <PageSkeleton />}
        {!isLoading && !flows?.length && (
          <EmptyState
            title="No flow configured"
            description="Start adding flows to your project to use them from your frontend"
          >
            {addFlowButton}
          </EmptyState>
        )}

        {!isLoading && !!flows?.length && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flows.map((flow) => (
                <FlowCard key={flow.id} flow={flow} />
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default Page;
