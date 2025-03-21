"use client";
import { OpenAPI } from "@/lib/services/gen-api";
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
  const [env, setEnv] = useState<EnvState>({
    SUPALLM_API_URL: null,
  });

  useEffect(() => {
    getEnv().then((env) => {
      setEnv(env);
      OpenAPI.BASE = env.SUPALLM_API_URL;
    });
  }, []);
  return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>;
};
