import { MockProjectService } from "@/services/mock-project-service";
import { GetProjectUsecase } from "./get-project";

export const getProjectUsecase = new GetProjectUsecase(
  new MockProjectService(),
);
