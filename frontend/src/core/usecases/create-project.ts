import { Project } from "@/core/entities/project";
import { ProjectService } from "@/core/interfaces";
import { setCurrentProject } from "../store/app-config";

export class CreateProjectUsecase {
  constructor(private readonly projectService: ProjectService) {}

  async execute(data: { name: string }): Promise<Project> {
    await this.projectService.create(data);

    const [project] = await this.projectService.listAll();

    if (!project) {
      throw new Error("Failed to retrieve created project");
    }

    setCurrentProject(project);

    return project;
  }
}
