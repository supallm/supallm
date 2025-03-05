import { Project } from "@/core/entities/project";
import { ProjectService } from "@/core/interfaces";

export class MockProjectService implements ProjectService {
  async getCurrentProject(): Promise<Project> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { id: "1", name: "Mock Project" };
  }
}
