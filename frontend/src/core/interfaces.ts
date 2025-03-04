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
  patch: (
    id: string,
    data: {
      name: string;
      apiKey: string | undefined;
    },
  ) => Promise<void>;
  delete: (id: string) => Promise<void>;
}
