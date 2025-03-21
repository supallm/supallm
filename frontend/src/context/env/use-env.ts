import { useContext } from "react";
import { EnvContext } from "./provider";

export const useEnv = () => {
  return useContext(EnvContext);
};

export const useValidatedEnv = () => {
  const env = useEnv();

  if (!env.SUPALLM_API_URL) {
    throw new Error("SUPALLM_API_URL is not set");
  }

  return {
    SUPALLM_API_URL: env.SUPALLM_API_URL,
  };
};
