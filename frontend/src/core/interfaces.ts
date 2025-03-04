import { Project } from "./entities/project";
import { LLMProvider } from "./entities/llm-provider";

export interface ProjectService {
  getCurrentProject: (userId: string) => Promise<Project>;
}

export interface LLMProviderService {
  listAll: (projectId: string) => Promise<LLMProvider[]>;
}
