import type {} from "@redux-devtools/extension"; // required for devtools typing
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Project } from "../entities/project";

interface AppConfigState {
  currentProject: Project | null;
  setCurrentProject: (project: Project) => void;
}

export const useAppConfigStore = create<AppConfigState>()(
  devtools(
    (set) => ({
      currentProject: null,
      setCurrentProject: (project) => set({ currentProject: project }),
    }),
    {
      name: "app-config",
    },
  ),
);

export const getCurrentProject = () => {
  return useAppConfigStore.getState().currentProject;
};

export const setCurrentProject = (project: Project) => {
  useAppConfigStore.getState().setCurrentProject(project);
};
