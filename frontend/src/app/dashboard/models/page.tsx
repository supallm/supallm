"use client";

import { AddModelDialog } from "@/components/add-model-dialog";
import { EmptyState } from "@/components/empty-state";
import {
  ModelTable,
  ModelTableColumns,
} from "@/components/model-table/model-table";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { Spacer } from "@/components/spacer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppConfigStore } from "@/core/store/app-config";
import { useModelStore } from "@/core/store/models";
import { useListModels } from "@/hooks/use-list-models";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

export const PageSkeleton = () => {
  return (
    <div className="">
      <PageContainer>
        <div className="flex justify-end">
          <Button disabled startContent={<PlusIcon className="w-3 h-3" />}>
            Add model
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

const ModelsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { currentProject } = useAppConfigStore();
  const { list: models } = useModelStore();

  if (!currentProject) {
    throw new Error("Unexpected error: no project id");
  }

  const { isLoading } = useListModels(currentProject.id);

  const addModelButton = (
    <Button
      onClick={() => setIsDialogOpen(true)}
      startContent={<PlusIcon className="w-3 h-3" />}
    >
      Add model
    </Button>
  );

  return (
    <div>
      <AddModelDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <PageHeader title="Models" />
      <Spacer />
      <PageContainer>
        {isLoading && <PageSkeleton />}
        {!isLoading && !models?.length && (
          <EmptyState
            title="No model configured"
            description="Start adding models to your project to use them from your frontend"
          >
            {addModelButton}
          </EmptyState>
        )}

        {!isLoading && !!models?.length && (
          <div>
            <div className="flex justify-end">{addModelButton}</div>
            <Spacer />

            <ModelTable data={models} columns={ModelTableColumns} />
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default ModelsPage;
