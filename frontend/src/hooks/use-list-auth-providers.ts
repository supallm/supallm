"use client";

import { AuthProviderConfig } from "@/core/entities/auth-provider";
import { listAuthProvidersUsecase } from "@/core/usecases";
import { Hookify } from "./hookify";

export const useListAuthProviders = Hookify(
  (projectId: string) => listAuthProvidersUsecase.execute(projectId),
  [] as AuthProviderConfig[],
);
