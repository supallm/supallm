"use client";

import { AuthUser } from "@/core/entities/auth";
import { logoutUsecase, meUsecase } from "@/core/usecases";
import { OverviewRoute } from "@/routes";
import { useRouter } from "next/navigation";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";

export type AuthContextValue = {
  user: AuthUser | null;
  logout: () => void;
  login: (user: AuthUser) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export const authContext = createContext<AuthContextValue>({
  user: null,
  logout: () => {},
  login: () => {},
  isAuthenticated: false,
  isLoading: true,
});

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user && !isLoading;

  const fetchUser = useCallback(async (): Promise<AuthUser | null> => {
    const user = await meUsecase.execute();

    if (!user) {
      return null;
    }

    return user;
  }, []);

  useEffect(() => {
    fetchUser()
      .then((user) => {
        setUser(user);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const logout = () => {
    setUser(null);
    logoutUsecase.execute();
  };

  const login = (user: AuthUser) => {
    setUser(user);
    router.replace(OverviewRoute.path());
  };

  return (
    <authContext.Provider
      value={{
        user,
        logout,
        login,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </authContext.Provider>
  );
};

export default AuthProvider;
