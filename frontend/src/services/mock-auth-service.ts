import { getAuthToken } from "@/actions";
import { AuthState, AuthUser } from "@/core/entities/auth";
import { AuthService } from "@/core/interfaces";

export class MockAuthService implements AuthService {
  private user: AuthUser | null = null;

  private setUser(user: AuthUser | null) {
    this.user = user;
  }

  async login(email: string, password: string): Promise<AuthState> {
    this.setUser({ email, name: "John Doe", id: "123" });
    return {
      token: "123",
      user: { email, name: "John Doe", id: "123" },
    };
  }

  async logout(): Promise<void> {
    this.setUser(null);
  }

  async me(): Promise<AuthUser | null> {
    const token = await getAuthToken();

    if (!token) {
      return null;
    }

    this.setUser({ email: "test@test.com", name: "John Doe", id: "123" });

    return this.user;
  }
}
