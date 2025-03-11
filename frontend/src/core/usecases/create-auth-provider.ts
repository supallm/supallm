import { AuthProviderService } from "@/core/interfaces";
import { AuthProvider } from "../entities/auth-provider";
import { setAuthProviderList } from "../store/auth-provider";

export class CreateAuthProviderUsecase {
  constructor(private readonly service: AuthProviderService) {}

  async execute(req: Omit<AuthProvider, "id">): Promise<AuthProvider> {
    const provider = await this.service.create(req);

    setAuthProviderList([provider]);

    return provider;
  }
}
