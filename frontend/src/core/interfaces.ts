import { Credential, ProviderType } from "./entities/credential";
import { Flow, FlowEdge, FlowNode } from "./entities/flow";
import { Model } from "./entities/model";
import { Project } from "./entities/project";

export interface ProjectService {
  listAll: (userId: string) => Promise<Project[]>;
  create: (data: { name: string }) => Promise<Project>;
}

export interface CredentialService {
  listAll: (projectId: string) => Promise<Credential[]>;
  create: (data: {
    projectId: string;
    name: string;
    apiKey: string;
    providerType: ProviderType;
  }) => Promise<Credential>;
  patch: (
    id: string,
    data: {
      name: string;
      apiKey: string | undefined;
    },
  ) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

export interface ModelService {
  create: (data: {
    projectId: string;
    name: string;
    credentialId: string;
    providerType: ProviderType;
    model: string;
    systemPrompt: string;
    temperature: number;
  }) => Promise<Model>;

  list: (projectId: string) => Promise<Model[]>;

  patch: (
    id: string,
    data: {
      name: string;
      credentialId: string;
      systemPrompt: string;
      temperature: number;
    },
  ) => Promise<void>;

  delete: (id: string) => Promise<void>;
}

export interface FlowService {
  create: (data: {
    name: string;
    projectId: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
  }) => Promise<Flow>;
  patch: (id: string, data: Partial<Flow>) => Promise<void>;
  getById: (id: string) => Promise<Flow | null>;
}
