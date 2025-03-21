import { logout } from "@/actions";
import { AuthState, AuthUser } from "@/core/entities/auth";
import { AuthService } from "@/core/interfaces";
import {
  AuthService as BackendAuthService,
  UserService,
} from "@/lib/services/gen-api";

export class ApiAuthService implements AuthService {
  async login(email: string, password: string): Promise<AuthState | null> {
    try {
      const authState = await BackendAuthService.login({
        requestBody: {
          email,
          password,
        },
      });

      return authState;
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    await logout();
  }

  async me(): Promise<AuthUser | null> {
    const user = await UserService.getMe();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
