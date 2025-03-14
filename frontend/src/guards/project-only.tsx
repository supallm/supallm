"use client";

import { GlobalLoading } from "@/components/global-loading";
import { useAppConfigStore } from "@/core/store/app-config";
import { NoProjectRoute } from "@/routes";
import { useRouter } from "next/navigation";
import { FC, PropsWithChildren, useEffect } from "react";

export const ProjectOnly: FC<PropsWithChildren> = ({ children }) => {
  const { currentProject } = useAppConfigStore();
  const router = useRouter();

  useEffect(() => {
    if (!currentProject) {
      router.push(NoProjectRoute.path());
    }
  }, [currentProject, router]);

  if (!currentProject) {
    return <GlobalLoading />;
  }

  return <>{children}</>;
};
