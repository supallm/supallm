import { AuthProvider } from "../entities/auth-provider";
import { createCrudStore } from "./crud-store";

export const useAuthProviderStore =
  createCrudStore<AuthProvider>("auth-provider");

export const getCurrentAuthProvider = () => {
  return useAuthProviderStore.getState().list[0] || null;
};

export const setAuthProviderList = (providers: AuthProvider[]) => {
  useAuthProviderStore.getState().set(providers);
};

export const addAuthProvider = (provider: AuthProvider) => {
  useAuthProviderStore.getState().add(provider);
};

export const patchAuthProvider = (id: string, data: Partial<AuthProvider>) => {
  useAuthProviderStore.getState().patch(id, data);
};

export const deleteAuthProvider = (id: string) => {
  useAuthProviderStore.getState().delete(id);
};

export const upsertAuthProvider = (provider: AuthProvider) => {
  useAuthProviderStore.getState().upsert(provider);
};
