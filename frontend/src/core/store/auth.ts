import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { AuthState, AuthUser } from "../entities/auth";

interface AuthStoreState {
  token: string | null;
  user: AuthUser | null;

  setAuthState: (state: AuthState) => void;
  clearAuthState: () => void;
}

export const useAuthStore = create<AuthStoreState>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        user: null,
        setAuthState: (state: AuthState) => set(state),
        clearAuthState: () => set({ token: null, user: null }),
      }),
      {
        name: "auth-store",
      },
    ),
  ),
);

export const getAuthState = () => {
  return useAuthStore.getState();
};

export const setAuthState = (state: AuthState) => {
  useAuthStore.getState().setAuthState(state);
};

export const clearAuthState = () => {
  useAuthStore.getState().clearAuthState();
};

export const getToken = () => {
  return useAuthStore.getState().token;
};

export const getUser = () => {
  return useAuthStore.getState().user;
};
