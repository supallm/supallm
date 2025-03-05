"use client";

import { GlobalLoading } from "@/components/global-loading";
import { useAppConfigStore } from "@/core/store/app-config";
import { NoProjectRoute } from "@/routes";
import { useRouter } from "next/navigation";
import { FC, PropsWithChildren } from "react";

export const ProjectOnly: FC<PropsWithChildren> = ({ children }) => {
  const { currentProject } = useAppConfigStore();
  const router = useRouter();

  if (!currentProject) {
    router.push(NoProjectRoute.path());
    return <GlobalLoading />;
  }

  return <>{children}</>;
};
