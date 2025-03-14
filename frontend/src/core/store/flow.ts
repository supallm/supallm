import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Flow } from "../entities/flow";
import { createCrudStore } from "./crud-store";

/**
 * Current flow store
 */
interface CurrentFlowStoreState {
  currentFlow: Flow | null;
  setCurrentFlow: (flow: Flow) => void;
  clearCurrentFlow: () => void;
  patch: (data: Partial<Flow>) => void;
}

export const useCurrentFlowStore = create<CurrentFlowStoreState>()(
  devtools((set) => ({
    currentFlow: null,
    setCurrentFlow: (flow) => set({ currentFlow: flow }),
    clearCurrentFlow: () => set({ currentFlow: null }),
    patch: (data: Partial<Flow>) =>
      set((state: CurrentFlowStoreState) => ({
        currentFlow: { ...state.currentFlow, ...data } as Flow,
      })),
  })),
);

export const setCurrentFlow = (flow: Flow) => {
  useCurrentFlowStore.getState().setCurrentFlow(flow);
};

export const clearCurrentFlow = () => {
  useCurrentFlowStore.getState().clearCurrentFlow();
};

export const patchCurrentFlow = (data: Partial<Flow>) => {
  useCurrentFlowStore.getState().patch(data);
};

/**
 * Flow CRUD store
 */

export const useFlowStore = createCrudStore<Flow>();

export const getFlowState = () => {
  return useFlowStore.getState().list;
};

export const setFlowList = (flows: Flow[]) => {
  useFlowStore.getState().set(flows);
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
