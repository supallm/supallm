import { Project } from "../entities/project";
import { createCrudStore } from "./crud-store";

export const useProjectStore = createCrudStore<Project>("projects");

export const getProjectList = () => {
  return useProjectStore.getState().list;
};

export const setProjectList = (item: Project[]) => {
  useProjectStore.getState().set(item);
};

export const addProject = (item: Project) => {
  useProjectStore.getState().add(item);
};

export const patchProject = (id: string, data: Partial<Project>) => {
  useProjectStore.getState().patch(id, data);
};

export const deleteProject = (id: string) => {
  useProjectStore.getState().delete(id);
};
