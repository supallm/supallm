import { Credential, ProviderType } from "@/core/entities/credential";
import { CredentialService } from "@/core/interfaces";
import {
  ProviderType as ApiProviderType,
  CredentialService as GenCredentialService,
} from "@/lib/services/gen-api";

export class ApiCredentialService implements CredentialService {
  constructor() {}

  async create(data: {
    projectId: string;
    name: string;
    apiKey: string;
    providerType: ProviderType;
  }): Promise<Credential> {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const { id } = await GenCredentialService.createCredential({
      projectId: data.projectId,
      requestBody: {
        name: data.name,
        apiKey: data.apiKey,
        provider: data.providerType as ApiProviderType,
      },
    });

    return {
      id,
      name: data.name,
      providerType: data.providerType,
      apiKeyPreview: data.apiKey,
      projectId: data.projectId,
    };
  }

  async listAll(projectId: string): Promise<Credential[]> {
    const credentials = await GenCredentialService.listCredentials({
      projectId,
    });

    return credentials.map((credential) => ({
      id: credential.id,
      name: credential.name,
      providerType: credential.provider as ProviderType,
      apiKeyPreview: credential.apiKey,
      projectId: projectId,
    }));
  }

  async patch(
    id: string,
    data: { projectId: string; name: string; apiKey: string | undefined },
  ) {
    await GenCredentialService.updateCredential({
      projectId: data.projectId,
      credentialId: id,
      requestBody: {
        name: data.name,
        apiKey: data.apiKey,
      },
    });
  }

  async delete(projectId: string, id: string) {
    await GenCredentialService.deleteCredential({
      projectId,
      credentialId: id,
    });
  }
}
