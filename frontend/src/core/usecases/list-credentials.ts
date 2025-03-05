import { CredentialService } from "@/core/interfaces";
import { Credential } from "../entities/credential";
import { setCredentials } from "../store/credentials";

export class ListCredentialsUsecase {
  constructor(private readonly credentialService: CredentialService) {}

  async execute(projectId: string): Promise<Credential[]> {
    const providers = await this.credentialService.listAll(projectId);

    setCredentials(providers);

    return providers;
  }
}
