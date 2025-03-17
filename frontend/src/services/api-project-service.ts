import { ProjectService } from "@/core/interfaces";
import { ProjectService as GenProjectService } from "@/lib/services/gen-api";

export class ApiProjectService implements ProjectService {
  constructor() {}

  async listAll() {
    const projects = await GenProjectService.listProjects();

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      secretKey: project.apiKey.key,
    }));
  }

  async create(data: { name: string }) {
    const { id } = await GenProjectService.createProject({
      requestBody: {
        name: data.name,
      },
    });

    return {
      id,
      name: data.name,
    };
  }
}
