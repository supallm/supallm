import { Project } from "./entities/project";
import { LLMProvider, LLMProviderName } from "./entities/llm-provider";

export interface ProjectService {
  getCurrentProject: (userId: string) => Promise<Project>;
}

export interface LLMProviderService {
  listAll: (projectId: string) => Promise<LLMProvider[]>;
  create: (data: {
    projectId: string;
    name: string;
    apiKey: string;
    providerType: LLMProviderName;
  }) => Promise<LLMProvider>;
}
