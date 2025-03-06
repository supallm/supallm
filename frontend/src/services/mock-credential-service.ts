import { Credential, ProviderType } from "@/core/entities/credential";
import { CredentialService } from "@/core/interfaces";
import { getAuthToken } from "@/lib/auth";

export class MockCredentialService implements CredentialService {
  private credentials: Credential[] = [];
  private storage: Storage | null;

  constructor() {
    this.storage = typeof window !== "undefined" ? window.sessionStorage : null;
  }

  private load() {
    const credentials = this.storage?.getItem("mock-credentials");
    if (credentials) {
      this.credentials = JSON.parse(credentials);
    }
  }

  private save() {
    this.storage?.setItem("mock-credentials", JSON.stringify(this.credentials));
  }

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

    this.credentials.push(createdProvider);
    this.save();

    return createdProvider;
  }

  async listAll(projectId: string): Promise<Credential[]> {
    const authToken = await getAuthToken();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.load();

    return this.credentials;
  }

  async patch(id: string, data: { name: string; apiKey: string | undefined }) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.credentials = this.credentials.map((credential) =>
      credential.id === id ? { ...credential, ...data } : credential,
    );

    this.save();
  }

  async delete(id: string) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.credentials = this.credentials.filter(
      (credential) => credential.id !== id,
    );
    this.save();
  }
}
