import { Flow } from "@/core/entities/flow";
import { getFlowUsecase } from "@/core/usecases";
import { Hookify } from "./hookify";

export const useFlow = Hookify(
  (flowId: string) => getFlowUsecase.execute(flowId),
  {} as Flow,
);
