"use client";

import { GlobalLoading } from "@/components/global-loading";
import { useAppConfig } from "@/hooks/use-app-config";
import { FC, PropsWithChildren } from "react";

export const App: FC<PropsWithChildren> = ({ children }) => {
  const { isLoading } = useAppConfig();

  if (isLoading) {
    return <GlobalLoading />;
  }

  return <>{children}</>;
};
