import { Flow } from "@/core/entities/flow";
import { listFlowsUsecase } from "@/core/usecases";
import { Hookify } from "./hookify";

export const useListFlows = Hookify(async () => {
  return await listFlowsUsecase.execute();
}, [] as Flow[]);
