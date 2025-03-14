import { AuthProviderService } from "@/core/interfaces";
import { setAuthProviderList } from "../store/auth-provider";

export class DeleteAuthProviderUsercase {
  constructor(private readonly service: AuthProviderService) {}

  async execute(id: string): Promise<void> {
    await this.service.delete(id);

    setAuthProviderList([]);
  }
}
