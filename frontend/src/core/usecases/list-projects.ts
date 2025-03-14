import { Project } from "@/core/entities/project";
import { ProjectService } from "@/core/interfaces";
import { setProjectList } from "../store/projects";

export class ListProjectsUsecase {
  constructor(private readonly projectService: ProjectService) {}

  async execute(): Promise<Project[]> {
    const projects = await this.projectService.listAll();

    setProjectList(projects);

    return projects;
  }
}
