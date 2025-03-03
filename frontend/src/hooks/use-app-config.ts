"use client";

import { Project } from "@/core/entities/project";
import { getProjectUsecase } from "@/core/usecases";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function useAppConfig() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const { user, isLoaded } = useUser();
  const [error, setError] = useState<Error | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    getProjectUsecase
      .execute(user.id)
      .then((project) => {
        setCurrentProject(project);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error);
        setIsLoading(false);
      });
  }, [user, isLoaded]);

  return { currentProject, isLoading, error };
}
