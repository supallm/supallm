import { LLMProvider } from "../entities/llm-provider";
import { createCrudStore } from "./crud-store";

export const useLLMProviderStore =
  createCrudStore<LLMProvider>("llm-providers");

export const getLLMProviders = () => {
  return useLLMProviderStore.getState().list;
};

export const setLLMProviders = (providers: LLMProvider[]) => {
  useLLMProviderStore.getState().set(providers);
};

export const addLLMProvider = (provider: LLMProvider) => {
  useLLMProviderStore.getState().add(provider);
};

export const patchLLMProvider = (id: string, data: Partial<LLMProvider>) => {
  useLLMProviderStore.getState().patch(id, data);
};

export const deleteLLMProvider = (id: string) => {
  useLLMProviderStore.getState().delete(id);
};
