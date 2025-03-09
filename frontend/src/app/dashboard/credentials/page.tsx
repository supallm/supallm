"use client";

import { AddCredentialDialog } from "@/components/add-credential-dialog";
import {
  CredentialTable,
  CredentialTableColumns,
} from "@/components/credential-table/credential-table";
import { EmptyState } from "@/components/empty-state";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { Spacer } from "@/components/spacer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppConfigStore } from "@/core/store/app-config";
import { useCredentialStore } from "@/core/store/credentials";
import { useListCredentials } from "@/hooks/use-list-credentials";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

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

const ProjectPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { currentProject } = useAppConfigStore();
  const { list: llmProviders } = useCredentialStore();

  if (!currentProject) {
    throw new Error("Unexpected error: no project id");
  }

  const { isLoading } = useListCredentials(currentProject.id);

  const addCredentialButton = (
    <Button
      onClick={() => setIsDialogOpen(true)}
      startContent={<PlusIcon className="w-3 h-3" />}
    >
      Add Credential
    </Button>
  );

  return (
    <div>
      <AddCredentialDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
      <PageHeader
        title="Credentials"
        actions={addCredentialButton}
        actionsLoading={isLoading}
      />
      <Spacer />
      <PageContainer>
        {isLoading && <PageSkeleton />}
        {!isLoading && !llmProviders?.length && (
          <EmptyState
            title="No Credentials"
            description="You don't have any Credentials yet. Add one to start using them."
          >
            {addCredentialButton}
          </EmptyState>
        )}

        {!isLoading && !!llmProviders?.length && (
          <div>
            <CredentialTable
              columns={CredentialTableColumns}
              data={llmProviders}
            />
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default ProjectPage;
