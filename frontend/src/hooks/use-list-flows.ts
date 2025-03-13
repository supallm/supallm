import { Flow } from "@/core/entities/flow";
import { listFlowsUsecase } from "@/core/usecases";
import { Hookify } from "./hookify";
import { useCurrentProjectOrThrow } from "./use-current-project-or-throw";

export const useListFlows = Hookify(async () => {
  const currentProject = useCurrentProjectOrThrow();

  return await listFlowsUsecase.execute(currentProject.id);
}, [] as Flow[]);
