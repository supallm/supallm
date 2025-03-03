import { Project } from "@/core/entities/project";
import { ProjectService } from "@/core/interfaces";
import { getCurrentProject, setCurrentProject } from "@/core/store/app-config";

export class GetProjectUsecase {
  constructor(private readonly projectService: ProjectService) {}

  async execute(userId: string): Promise<Project> {
    const currentProject = getCurrentProject();

    if (currentProject) {
      return currentProject;
    }

    const project = await this.projectService.getCurrentProject(userId);

    setCurrentProject(project);

    return project;
  }
}
