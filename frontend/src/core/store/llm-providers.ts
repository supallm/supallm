import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {} from "@redux-devtools/extension"; // required for devtools typing
import { Project } from "../entities/project";
import { LLMProvider } from "../entities/llm-provider";

interface LLMProviderState {
  llmProviders: LLMProvider[];
  setLLMProviders: (providers: LLMProvider[]) => void;
  addLLMProvider: (provider: LLMProvider) => void;
}

export const useLLMProviderStore = create<LLMProviderState>()(
  devtools(
    persist(
      (set) => ({
        llmProviders: [],
        setLLMProviders: (providers) => set({ llmProviders: providers }),
        addLLMProvider: (provider: LLMProvider) =>
          set((state) => ({
            llmProviders: [...state.llmProviders, provider],
          })),
      }),
      {
        name: "llm-providers",
      },
    ),
  ),
);

export const getLLMProviders = () => {
  return useLLMProviderStore.getState().llmProviders;
};

export const setLLMProviders = (providers: LLMProvider[]) => {
  useLLMProviderStore.getState().setLLMProviders(providers);
};

export const addLLMProvider = (provider: LLMProvider) => {
  useLLMProviderStore.getState().addLLMProvider(provider);
};
