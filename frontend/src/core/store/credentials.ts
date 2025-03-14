import { Credential } from "../entities/credential";
import { createCrudStore } from "./crud-store";

export const useCredentialStore = createCrudStore<Credential>();

export const getCredentials = () => {
  return useCredentialStore.getState().list;
};

export const setCredentials = (providers: Credential[]) => {
  useCredentialStore.getState().set(providers);
};

export const addCredential = (provider: Credential) => {
  useCredentialStore.getState().add(provider);
};

export const patchCredential = (id: string, data: Partial<Credential>) => {
  useCredentialStore.getState().patch(id, data);
};

export const deleteCredential = (id: string) => {
  useCredentialStore.getState().delete(id);
};
