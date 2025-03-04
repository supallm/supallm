"use client";

import { listLLMProvidersUsecase } from "@/core/usecases";
import { LLMProvider } from "@/core/entities/llm-provider";
import { Hookify } from "./hookify";

export const useListLLMProviders = Hookify(
  (projectId: string) => listLLMProvidersUsecase.execute(projectId),
  [] as LLMProvider[],
);
