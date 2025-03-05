import { MockProjectService } from "@/services/mock-project-service";
import { GetProjectUsecase } from "./get-project";
import { MockLLMProviderService } from "@/services/mock-llm-provider-service";
import { ListLLMProvidersUsecase } from "./list-llm-providers";
import { CreateLLMProviderUsecase } from "./create-llm-provider";
import { PatchLLMProviderUsecase } from "./patch-llm-provider";
import { DeleteLLMProviderUsecase } from "./delete-llm-provider";
import { CreateModelUsecase } from "./create-model";
import { MockModelService } from "@/services/mock-model-service";
import { ListModelUsecase } from "./list-models";

/**
 * Project
 */
export const getProjectUsecase = new GetProjectUsecase(
  new MockProjectService(),
);

/**
 * Credentials
 */
export const listLLMProvidersUsecase = new ListLLMProvidersUsecase(
  new MockLLMProviderService(),
);

export const createLLMProviderUsecase = new CreateLLMProviderUsecase(
  new MockLLMProviderService(),
);

export const patchLLMProviderUsecase = new PatchLLMProviderUsecase(
  new MockLLMProviderService(),
);

export const deleteLLMProviderUsecase = new DeleteLLMProviderUsecase(
  new MockLLMProviderService(),
);

/**
 * Models
 */

export const createModelUsecase = new CreateModelUsecase(
  new MockModelService(),
);

export const listModelUsecase = new ListModelUsecase(new MockModelService());
