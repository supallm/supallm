import { Project } from "@/core/entities/project";
import { ProjectService } from "@/core/interfaces";

export class MockProjectService implements ProjectService {
  private projects: Project[] = [];
  private storage: Storage | null = null;

  constructor() {
    this.storage = typeof window !== "undefined" ? window.sessionStorage : null;
  }

  private saveProjects() {
    this.storage?.setItem("mock-projects", JSON.stringify(this.projects));
  }

  private loadProjects() {
    const projects = this.storage?.getItem("mock-projects");
    if (projects) {
      this.projects = JSON.parse(projects);
    }
  }

  async listAll() {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    this.loadProjects();
    return this.projects;
  }

  async create(data: { name: string }) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const project = {
      id: crypto.randomUUID(),
      name: data.name,
    };

    this.projects.push(project);
    this.saveProjects();

    return project;
  }
}
