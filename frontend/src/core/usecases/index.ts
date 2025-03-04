import { MockProjectService } from "@/services/mock-project-service";
import { GetProjectUsecase } from "./get-project";
import { MockLLMProviderService } from "@/services/mock-llm-provider-service";
import { ListLLMProvidersUsecase } from "./list-llm-providers";
import { CreateLLMProviderUsecase } from "./create-llm-provider";
import { PatchLLMProviderUsecase } from "./patch-llm-provider";

export const getProjectUsecase = new GetProjectUsecase(
  new MockProjectService(),
);

export const listLLMProvidersUsecase = new ListLLMProvidersUsecase(
  new MockLLMProviderService(),
);

export const createLLMProviderUsecase = new CreateLLMProviderUsecase(
  new MockLLMProviderService(),
);

export const patchLLMProviderUsecase = new PatchLLMProviderUsecase(
  new MockLLMProviderService(),
);
