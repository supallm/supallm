import { CredentialService } from "@/core/interfaces";
import { patchCredential } from "../store/credentials";

export class PatchCredentialUsecase {
  constructor(private readonly credentialService: CredentialService) {}

  async execute(
    id: string,
    data: {
      name: string;
      apiKey: string | undefined;
      projectId: string;
    },
  ) {
    await this.credentialService.patch(id, data);

    patchCredential(id, {
      name: data.name,
    });
  }
}
