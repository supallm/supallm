import { AuthProvider } from "@/core/entities/auth-provider";
import { AuthProviderService } from "@/core/interfaces";

export class MockAuthProviderService implements AuthProviderService {
  private providers: AuthProvider[] = [];
  private storage: Storage | null = null;
  private key = "auth-providers";

  constructor() {
    if (typeof window !== "undefined") {
      this.storage = localStorage;
    }
  }

  private loadProviders() {
    const providers = this.storage?.getItem(this.key);

    if (providers) {
      this.providers = JSON.parse(providers);
    }
  }

  private saveProviders() {
    this.storage?.setItem(this.key, JSON.stringify(this.providers));
  }

  async create(data: Omit<AuthProvider, "id">): Promise<AuthProvider> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const provider = {
      id: crypto.randomUUID(),
      name: data.name,
      projectId: data.projectId,
      config: data.config,
    };

    this.providers.push(provider);
    this.saveProviders();

    return provider;
  }

  async listAll(): Promise<AuthProvider[]> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.loadProviders();

    return this.providers;
  }

  async delete(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 4000));

    this.providers = this.providers.filter((provider) => provider.id !== id);
    this.saveProviders();
  }

  async patch(id: string, data: { secretKey: string }) {
    await new Promise((resolve) => setTimeout(resolve, 4000));

    this.loadProviders();
    this.providers = this.providers.map((provider) =>
      provider.id === id
        ? {
            ...provider,
            config: { ...provider.config, secretKey: data.secretKey },
          }
        : provider,
    );
    this.saveProviders();
  }
}
