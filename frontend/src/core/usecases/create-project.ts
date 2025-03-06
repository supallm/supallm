import { Project } from "@/core/entities/project";
import { ProjectService } from "@/core/interfaces";
import { setCurrentProject } from "../store/app-config";

export class CreateProjectUsecase {
  constructor(private readonly projectService: ProjectService) {}

  async execute(data: { name: string }): Promise<Project> {
    const project = await this.projectService.create(data);

    setCurrentProject(project);

    return project;
  }
}
