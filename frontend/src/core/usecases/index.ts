import { MockProjectService } from "@/services/mock-project-service";
import { GetProjectUsecase } from "./get-project";
import { MockLLMProviderService } from "@/services/mock-llm-provider-service";
import { ListLLMProvidersUsecase } from "./list-llm-providers";

export const getProjectUsecase = new GetProjectUsecase(
  new MockProjectService(),
);

export const listLLMProvidersUsecase = new ListLLMProvidersUsecase(
  new MockLLMProviderService(),
);
