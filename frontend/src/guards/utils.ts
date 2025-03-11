import { Project } from "@/core/entities/project";

export const assertProjectIsDefined = (project: Project | null) => {
  if (!project) {
    throw new Error(
      "Current project is not defined. Make sure this component is wrapped into a <ProjectOnly /> guard.",
    );
  }
};
