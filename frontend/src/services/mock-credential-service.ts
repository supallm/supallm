import { Credential, ProviderType } from "@/core/entities/credential";
import { CredentialService } from "@/core/interfaces";
import { getAuthToken } from "@/lib/auth";

export class MockCredentialService implements CredentialService {
  async create(data: {
    name: string;
    apiKey: string;
    providerType: ProviderType;
  }): Promise<Credential> {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const createdProvider = {
      id: crypto.randomUUID(),
      providerType: data.providerType,
      name: data.name,
      apiKeyPreview: data.apiKey.slice(0, 4) + "...",
    };

    return createdProvider;
  }

  async listAll(projectId: string): Promise<Credential[]> {
    const authToken = await getAuthToken();

    console.log("listAll", projectId, authToken);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return [];
  }

  async patch() {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  async delete() {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
