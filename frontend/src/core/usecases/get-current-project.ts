import { Project } from "@/core/entities/project";
import { ProjectService } from "@/core/interfaces";
import { setCurrentProject } from "@/core/store/app-config";

export class GetCurrentProjectUsecase {
  constructor(private readonly projectService: ProjectService) {}

  async execute(): Promise<Project | null> {
    const projects = await this.projectService.listAll();

    if (!projects?.length) {
      return null;
    }

    const project = projects[0];

    setCurrentProject(project);

    return project;
  }
}
