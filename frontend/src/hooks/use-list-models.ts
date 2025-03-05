"use client";

import { Model } from "@/core/entities/model";
import { Hookify } from "./hookify";
import { listModelUsecase } from "@/core/usecases";

export const useListModels = Hookify(
  (projectId: string) => listModelUsecase.execute(projectId),
  [] as Model[],
);
