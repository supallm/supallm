import { OpenAPI } from "@/lib/services/gen-api";
import { AuthState } from "../entities/auth";
import { AuthService } from "../interfaces";

export class LoginWithEmailAndPasswordUsecase {
  constructor(private readonly service: AuthService) {}

  async execute(
    req: {
      email: string;
      password: string;
    },
    options?: {
      openApiBase: string;
    },
  ): Promise<AuthState | null> {
    try {
      if (options?.openApiBase) {
        OpenAPI.BASE = options.openApiBase;
      }

      const provider = await this.service.login(req.email, req.password);

      return provider;
    } catch {
      return null;
    }
  }
}
