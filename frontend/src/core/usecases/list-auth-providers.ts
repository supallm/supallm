import { AuthProviderService } from "@/core/interfaces";
import { AuthProvider } from "../entities/auth-provider";
import { setAuthProviderList } from "../store/auth-provider";

export class ListAuthProvidersUsecase {
  constructor(private readonly service: AuthProviderService) {}

  async execute(projectId: string): Promise<AuthProvider[]> {
    const providers = await this.service.listAll(projectId);

    setAuthProviderList(providers);

    return providers;
  }
}
