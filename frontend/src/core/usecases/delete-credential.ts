import { CredentialService } from "@/core/interfaces";
import { deleteCredential } from "../store/credentials";

export class DeleteCredentialUsecase {
  constructor(private readonly credentialService: CredentialService) {}

  async execute(id: string) {
    await this.credentialService.delete(id);

    deleteCredential(id);
  }
}
