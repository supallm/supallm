"use client";
import { GlobalLoading } from "@/components/global-loading";
import { createContext, useEffect, useState } from "react";
import { getEnv } from "./env";

type EnvState = {
  SUPALLM_API_URL: string | null;
};

export const EnvContext = createContext<EnvState>({
  SUPALLM_API_URL: null,
});

export const EnvProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [isLoading, setIsLoading] = useState(true);
  const [env, setEnv] = useState<EnvState>({
    SUPALLM_API_URL: null,
  });

  useEffect(() => {
    getEnv()
      .then((env) => {
        setEnv(env);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isLoading]);

  if (isLoading) {
    return <GlobalLoading />;
  }

  return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>;
};
