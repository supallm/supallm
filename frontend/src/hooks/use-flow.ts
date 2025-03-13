import { Flow } from "@/core/entities/flow";
import { getFlowUsecase } from "@/core/usecases";
import { Hookify } from "./hookify";

export const useFlow = Hookify(
  (projectId: string, flowId: string) =>
    getFlowUsecase.execute(projectId, flowId),
  {} as Flow,
);
