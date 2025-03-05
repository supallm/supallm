"use client";

import { Credential } from "@/core/entities/credential";
import { listCredentialsUsecase } from "@/core/usecases";
import { Hookify } from "./hookify";

export const useListCredentials = Hookify(
  (projectId: string) => listCredentialsUsecase.execute(projectId),
  [] as Credential[],
);
