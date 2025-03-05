import { CredentialService } from "@/core/interfaces";
import { Credential, ProviderType } from "../entities/credential";
import { addCredential } from "../store/credentials";

export class CreateCredentialUsecase {
  constructor(private readonly credentialService: CredentialService) {}

  async execute(req: {
    name: string;
    apiKey: string;
    providerType: ProviderType;
    projectId: string;
  }): Promise<Credential> {
    const provider = await this.credentialService.create(req);

    addCredential(provider);

    return provider;
  }
}
