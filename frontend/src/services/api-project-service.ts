import { ProjectService } from "@/core/interfaces";
import { ProjectService as GenProjectService } from "@/lib/services/gen-api";

export class ApiProjectService implements ProjectService {
  constructor() {}

  async listAll() {
    const projects = await GenProjectService.listProjects();

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      secretKey: "no-secret-key-please-add-it-backend-boy",
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
