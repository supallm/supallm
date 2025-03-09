import type {} from "@redux-devtools/extension"; // required for devtools typing
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface CrudState<T extends Partial<{ id: string }>> {
  list: T[];
  set: (items: T[]) => void;
  add: (item: T) => void;
  patch: (id: string, data: Partial<T>) => void;
  delete: (id: string) => void;
  upsert: (data: T) => void;
}

export const createCrudStore = <T extends { id: string }>(name: string) => {
  const store = create<CrudState<T>>()(
    devtools(
      persist(
        (set) => ({
          list: [],
          set: (items) => {
            set({ list: items });
          },
          add: (item: T) => {
            set((state) => ({
              list: [...state.list, item],
            }));
          },
          patch: (id, data) =>
            set((state) => ({
              list: state.list.map((item) =>
                item.id === id ? { ...item, ...data } : item,
              ),
            })),
          delete: (id) =>
            set((state) => ({
              list: state.list.filter((item) => item.id !== id),
            })),
          upsert: (data) =>
            set((state) => ({
              list: state.list.find((item) => item.id === data.id)
                ? state.list.map((item) =>
                    item.id === data.id ? { ...item, ...data } : item,
                  )
                : [...state.list, data],
            })),
        }),
        {
          name,
        },
      ),
    ),
  );

  return store;
};
