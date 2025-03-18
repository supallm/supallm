import { AuthProvider } from "./entities/auth-provider";
import { Credential, ProviderType } from "./entities/credential";
import { Flow, FlowEdge, FlowNode } from "./entities/flow";
import { Model } from "./entities/model";
import { Project } from "./entities/project";

export interface ProjectService {
  listAll: () => Promise<Project[]>;
  create: (data: { name: string }) => Promise<{ id: string; name: string }>;
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
      projectId: string;
      name: string;
      apiKey: string | undefined;
    },
  ) => Promise<void>;
  delete: (projectId: string, id: string) => Promise<void>;
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
  patch: (
    projectId: string,
    id: string,
    data: Pick<Flow, "name" | "edges" | "nodes">,
  ) => Promise<void>;
  getById: (projectId: string, id: string) => Promise<Flow | null>;
  listAll(projectId: string): Promise<Flow[]>;
  delete: (projectId: string, id: string) => Promise<void>;
}

export interface AuthProviderService {
  listAll: (projectId: string) => Promise<AuthProvider[]>;
  create: (data: Omit<AuthProvider, "id">) => Promise<AuthProvider>;
  delete: (id: string) => Promise<void>;
  patch: (id: string, data: { secretKey: string }) => Promise<void>;
}

export interface SandboxService {
  runCode: (data: {
    projectId: string;
    code: string;
    language: "typescript";
    args: unknown[];
    onLog: (log: string) => void;
    onResult: (result: string) => void;
    onError: (error: string) => void;
  }) => Promise<void>;
}
