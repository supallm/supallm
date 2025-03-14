"use client";

import { useCurrentFlowStore } from "@/core/store/flow";
import { patchFlowUsecase } from "@/core/usecases";
import { hookifyFunction } from "@/hooks/hookify-function";
import { useAppConfig } from "@/hooks/use-app-config";
import { ChatFlowsRoute } from "@/routes";
import { useOrganization } from "@clerk/nextjs";
import {
  ArrowLeft,
  BookIcon,
  MessageCircleQuestion,
  Slash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { EditableName } from "./editable-name";
import Logo from "./logo";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

const OrganizationBreadcrumb = () => {
  const { organization, isLoaded: organizationLoaded } = useOrganization();
  const { currentProject, isLoading: currentProjectLoading } = useAppConfig();
  const { currentFlow } = useCurrentFlowStore();

  const { isLoading: isPatching, execute: patchFlow } = hookifyFunction(
    patchFlowUsecase.execute.bind(patchFlowUsecase),
  );

  const handleNameChange = (newName: string) => {
    if (!currentProject || newName.length === 0) {
      return;
    }

    if (!!currentFlow) {
      patchFlow(currentProject?.id, currentFlow.id, {
        name: newName,
        nodes: currentFlow.nodes,
        edges: currentFlow.edges,
      });
    }
  };

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {(organizationLoaded && organization?.name) ?? "Personal account"}
            {!organizationLoaded && <Skeleton className="h-4 w-24" />}
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            {!currentProjectLoading && currentProject?.name}
            {currentProjectLoading && <Skeleton className="h-4 w-24" />}
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            {currentFlow ? (
              <EditableName
                content={currentFlow.name}
                onChange={handleNameChange}
                isLoading={isPatching}
              />
            ) : (
              <Skeleton className="h-4 w-24" />
            )}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export const BuilderTopNav = () => {
  const router = useRouter();

  const handleBackClick = () => {
    router.push(ChatFlowsRoute.path());
  };

  return (
    <div className="h-[40px] w-full border-b flex items-center fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="w-10 h-full flex items-center justify-center mr-2 border-r">
        <Logo width={30} />
      </div>

      <div className="grow flex items-center gap-3">
        <Button variant={"icon"} size="xs" onClick={handleBackClick}>
          <ArrowLeft className="size-4" />
        </Button>
        <OrganizationBreadcrumb />
      </div>

      <div className="px-3 space-x-2 flex items-center">
        <Button variant={"outline"} size="xs" startContent={<BookIcon />}>
          Documentation
        </Button>
        <Button variant={"icon"} size="xs">
          <MessageCircleQuestion className="size-4" />
        </Button>
      </div>
    </div>
  );
};
