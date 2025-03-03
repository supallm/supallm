import { Project } from "@/core/entities/project";
import { ProjectService } from "@/core/interfaces";

export class MockProjectService implements ProjectService {
  async getCurrentProject(userId: string): Promise<Project> {
    return { id: "1", name: "Mock Project" };
  }
}
