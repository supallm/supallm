"use client";

import { useAppConfig } from "@/hooks/use-app-config";
import { FC, PropsWithChildren } from "react";
import { GlobalLoading } from "@/components/global-loading";

export const App: FC<PropsWithChildren> = ({ children }) => {
  const { isLoading } = useAppConfig();

  if (isLoading) {
    return <GlobalLoading />;
  }

  return <>{children}</>;
};
