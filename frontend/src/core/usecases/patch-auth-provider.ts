import { AuthProviderService } from "@/core/interfaces";
import { patchCredential } from "../store/credentials";

export class PatchAuthProviderUsecase {
  constructor(private readonly service: AuthProviderService) {}

  async execute(
    id: string,
    data: {
      secretKey: string | undefined;
    },
  ) {
    await this.service.patch(id, data);

    patchCredential(id, {
      name: data.name,
    });
  }
}
