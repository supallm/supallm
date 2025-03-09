"use client";

import { EmptyState } from "@/components/empty-state";
import {
  FlowTable,
  FlowTableColumns,
} from "@/components/flow-table/flow-table";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { Spacer } from "@/components/spacer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppConfigStore } from "@/core/store/app-config";
import { useFlowStore } from "@/core/store/flow";
import { createFlowUsecase } from "@/core/usecases";
import { hookifyFunction } from "@/hooks/hookify-function";
import { useListFlows } from "@/hooks/use-list-flows";
import { FlowBuilderRoute } from "@/routes";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PageSkeleton = () => {
  return (
    <div className="">
      <PageContainer>
        <div className="flex justify-end">
          <Button disabled startContent={<PlusIcon className="w-3 h-3" />}>
            Add flow
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

const Page = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { currentProject } = useAppConfigStore();
  const { list: flows } = useFlowStore();
  const router = useRouter();

  if (!currentProject) {
    throw new Error("Unexpected error: no project id");
  }

  const { isLoading: isCreating, execute: createFlow } = hookifyFunction(
    createFlowUsecase.execute.bind(createFlowUsecase),
  );

  const { isLoading } = useListFlows();

  const handleAddFlow = async () => {
    try {
      const newFlow = await createFlow({
        name: "Untitled Flow",
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
      <PageHeader title="Flows" />
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
            <div className="flex justify-end">{addFlowButton}</div>
            <Spacer />

            <FlowTable data={flows} columns={FlowTableColumns} />
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default Page;
