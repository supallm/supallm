import { Project } from "@/core/entities/project";
import { ProjectService } from "@/core/interfaces";
import { setProjectList } from "../store/projects";

export class ListProjectsUsecase {
  constructor(private readonly projectService: ProjectService) {}

  async execute(userId: string): Promise<Project[]> {
    const projects = await this.projectService.listAll(userId);

    setProjectList(projects);

    return projects;
  }
}
