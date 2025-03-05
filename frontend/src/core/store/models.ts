import type {} from "@redux-devtools/extension"; // required for devtools typing
import { Model } from "../entities/model";
import { createCrudStore } from "./crud-store";

export const useModelStore = createCrudStore<Model>("models");

export const getModels = () => {
  return useModelStore.getState().list;
};

export const setModels = (models: Model[]) => {
  useModelStore.getState().set(models);
};

export const addModel = (model: Model) => {
  useModelStore.getState().add(model);
};

export const patchModel = (id: string, data: Partial<Model>) => {
  useModelStore.getState().patch(id, data);
};

export const deleteModel = (id: string) => {
  useModelStore.getState().delete(id);
};
