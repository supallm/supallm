import { AuthUser } from "../entities/auth";
import { AuthService } from "../interfaces";

export class MeUsecase {
  constructor(private readonly service: AuthService) {}

  async execute(): Promise<AuthUser | null> {
    try {
      const user = await this.service.me();

      return user;
    } catch (error) {
      return null;
    }
  }
}
