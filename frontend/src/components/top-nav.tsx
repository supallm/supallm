"use client";

import { useCurrentProjectOrThrow } from "@/hooks/use-current-project-or-throw";
import { Github, Slash } from "lucide-react";
import Logo from "./logo";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Button } from "./ui/button";

const OrganizationBreadcrumb = () => {
  const currentProject = useCurrentProjectOrThrow();

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>Personal account</BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>{currentProject?.name}</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export const TopNav = () => {
  return (
    <div className="h-[40px] w-full border-b flex items-center fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="w-10 h-full flex items-center justify-center mr-4">
        <Logo width={30} />
      </div>

      <div className="grow">
        <OrganizationBreadcrumb />
      </div>

      <div className="px-3 space-x-2">
        <Button
          variant={"outline"}
          size="xs"
          startContent={<Github />}
          onClick={() => {
            window.open("https://github.com/supallm/supallm", "_blank");
          }}
        >
          Beta - Help us improve
        </Button>
      </div>
    </div>
  );
};
