import { Project } from "./entities/project";

export interface ProjectService {
  getCurrentProject: (userId: string) => Promise<Project>;
}
