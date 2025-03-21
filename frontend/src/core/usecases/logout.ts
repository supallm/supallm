import { logout } from "@/actions";

export class LogoutUsecase {
  constructor() {}

  async execute(): Promise<void> {
    await logout();
  }
}
