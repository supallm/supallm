"use client";

import { GlobalLoading } from "@/components/global-loading";
import { useAuth } from "@/context/auth/use-auth";
import { useAppConfigStore } from "@/core/store/app-config";
import { getCurrentProjectUsecase } from "@/core/usecases";
import { NoProjectRoute } from "@/routes";
import { useRouter } from "next/navigation";
import { FC, PropsWithChildren, useEffect } from "react";

export const ProjectOnly: FC<PropsWithChildren> = ({ children }) => {
  const { currentProject, setCurrentProject } = useAppConfigStore();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      return;
    }

    if (currentProject) {
      return;
    }

    getCurrentProjectUsecase
      .execute()
      .then((project) => {
        if (!project) {
          router.push(NoProjectRoute.path());
        }

        setCurrentProject(project!);
      })
      .catch((error) => {
        console.error("Error getting current project", error);
      });
  }, [currentProject, router, user, setCurrentProject]);

  if (!currentProject) {
    return <GlobalLoading />;
  }

  return <>{children}</>;
};
