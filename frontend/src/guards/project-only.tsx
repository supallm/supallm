"use client";

import { GlobalLoading } from "@/components/global-loading";
import { useAuth } from "@/context/auth/use-auth";
import { useAppConfigStore } from "@/core/store/app-config";
import { getCurrentProjectUsecase } from "@/core/usecases";
import { NoProjectRoute } from "@/routes";
import { useRouter } from "next/navigation";
import { FC, PropsWithChildren, useEffect, useState } from "react";

export const ProjectOnly: FC<PropsWithChildren> = ({ children }) => {
  const { currentProject, setCurrentProject } = useAppConfigStore();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      return;
    }

    if (currentProject) {
      setIsLoading(false);
      return;
    }

    getCurrentProjectUsecase
      .execute()
      .then((project) => {
        if (!project) {
          router.push(NoProjectRoute.path());
        }

        setCurrentProject(project!);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error);
        setIsLoading(false);
      });
  }, [currentProject, router]);

  if (!currentProject) {
    return <GlobalLoading />;
  }

  return <>{children}</>;
};
