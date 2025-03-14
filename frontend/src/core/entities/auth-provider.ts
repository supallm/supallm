export const AuthProviderNames = [
  "supabase",
  "firebase",
  "auth0",
  "jwt",
] as const;

export type AuthProviderName = (typeof AuthProviderNames)[number];

export type SupabaseAuthProviderConfig = {
  projectUrl: string;
  jwtSecret: string;
};

export type FirebaseAuthProviderConfig = unknown;

export type Auth0AuthProviderConfig = unknown;

export type JwtAuthProviderConfig = unknown;

export type AuthProviderConfig =
  | SupabaseAuthProviderConfig
  | FirebaseAuthProviderConfig
  | Auth0AuthProviderConfig;

export type AuthProvider = {
  id: string;
  projectId: string;
  name: AuthProviderName;
  config: AuthProviderConfig;
};

export const AuthProviderLabelMap: Record<AuthProviderName, string> = {
  supabase: "Supabase",
  firebase: "Firebase",
  auth0: "Auth0",
  jwt: "JWT",
};

export const AuthProviderLabel = (name: AuthProviderName) => {
  return AuthProviderLabelMap[name];
};
