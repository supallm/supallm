export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type AuthState = {
  token: string;
  user: AuthUser;
};
