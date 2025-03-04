"use client";

import { BookIcon, MessageCircleQuestion, Slash } from "lucide-react";
import Logo from "./logo";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { Skeleton } from "./ui/skeleton";
import { useAppConfig } from "@/hooks/use-app-config";
import { Button } from "./ui/button";
import { IconQuestionMark } from "@tabler/icons-react";

const OrganizationBreadcrumb = () => {
  const { organization, isLoaded: organizationLoaded } = useOrganization();

  const { currentProject, isLoading: currentProjectLoading } = useAppConfig();

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
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export const TopNav = () => {
  return (
    <div className="h-[40px] w-full border-b flex items-center fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="w-10 h-full flex items-center justify-center mr-4">
        <Logo width={30} height={30} />
      </div>

      <div className="grow">
        <OrganizationBreadcrumb />
      </div>

      <div className="px-3 space-x-2">
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
