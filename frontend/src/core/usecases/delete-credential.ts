import { CredentialService } from "@/core/interfaces";
import { deleteCredential } from "../store/credentials";

export class DeleteCredentialUsecase {
  constructor(private readonly credentialService: CredentialService) {}

  async execute(projectId: string, id: string) {
    await this.credentialService.delete(projectId, id);

    deleteCredential(id);
  }
}
