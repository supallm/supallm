import { AuthProviderService } from "@/core/interfaces";
import { patchAuthProvider } from "../store/auth-provider";

export class PatchAuthProviderUsecase {
  constructor(private readonly service: AuthProviderService) {}

  async execute(
    id: string,
    data: {
      secretKey: string | undefined;
    },
  ) {
    await this.service.patch(id, {
      secretKey: data.secretKey ?? "",
    });

    patchAuthProvider(id, {
      config: {
        secretKey: data.secretKey ?? "",
      },
    });
  }
}
