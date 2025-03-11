"use client";

import { useAppConfigStore } from "@/core/store/app-config";

export function useCurrentProjectOrThrow() {
  const { currentProject } = useAppConfigStore();

  if (!currentProject) {
    throw new Error(
      "Current project is not defined. Make sure this component is wrapped into a <ProjectOnly /> guard.",
    );
  }

  return currentProject;
}
