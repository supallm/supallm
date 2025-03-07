import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Flow } from "../entities/flow";
import { createCrudStore } from "./crud-store";

/**
 * Current flow store
 */
interface CurrentFlowStoreState {
  currentFlow: Flow | null;
  setCurrentFlow: (flow: Flow) => void;
  clearCurrentFlow: () => void;
}

export const useCurrentFlowStore = create<CurrentFlowStoreState>()(
  devtools(
    persist(
      (set) => ({
        currentFlow: null,
        setCurrentFlow: (flow) => set({ currentFlow: flow }),
        clearCurrentFlow: () => set({ currentFlow: null }),
      }),
      { name: "current-flow" },
    ),
  ),
);

export const setCurrentFlow = (flow: Flow) => {
  useCurrentFlowStore.getState().setCurrentFlow(flow);
};

export const clearCurrentFlow = () => {
  useCurrentFlowStore.getState().clearCurrentFlow();
};

/**
 * Flow CRUD store
 */

export const useFlowStore = createCrudStore<Flow>("flow");

export const getFlowState = () => {
  return useFlowStore.getState().list;
};

export const addFlow = (flow: Flow) => {
  useFlowStore.getState().add(flow);
};

export const patchFlow = (id: string, data: Partial<Flow>) => {
  useFlowStore.getState().patch(id, data);
};

export const deleteFlow = (id: string) => {
  useFlowStore.getState().delete(id);
};

export const getFlow = (id: string) => {
  return useFlowStore.getState().list.find((flow) => flow.id === id);
};

export const upsertFlow = (flow: Flow) => {
  useFlowStore.getState().upsert(flow);
};
