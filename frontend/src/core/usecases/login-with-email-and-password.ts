import { AuthState } from "../entities/auth";
import { AuthService } from "../interfaces";
import { setAuthState } from "../store/auth";

export class LoginWithEmailAndPasswordUsecase {
  constructor(private readonly service: AuthService) {}

  async execute(req: {
    email: string;
    password: string;
  }): Promise<AuthState | null> {
    try {
      const provider = await this.service.login(req.email, req.password);

      setAuthState(provider);

      return provider;
    } catch (error) {
      return null;
    }
  }
}
