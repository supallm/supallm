import { Flow } from "@/core/entities/flow";
import { listFlowsUsecase } from "@/core/usecases";
import { Hookify } from "./hookify";

export const useListFlows = Hookify((projectId: string) => {
  return listFlowsUsecase.execute(projectId);
}, [] as Flow[]);
