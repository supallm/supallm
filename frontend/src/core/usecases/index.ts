import { MockLLMProviderService } from "@/services/mock-llm-provider-service";
import { MockModelService } from "@/services/mock-model-service";
import { MockProjectService } from "@/services/mock-project-service";
import { CreateLLMProviderUsecase } from "./create-llm-provider";
import { CreateModelUsecase } from "./create-model";
import { DeleteLLMProviderUsecase } from "./delete-llm-provider";
import { DeleteModelUsecase } from "./delete-model";
import { GetProjectUsecase } from "./get-project";
import { ListLLMProvidersUsecase } from "./list-llm-providers";
import { ListModelUsecase } from "./list-models";
import { PatchLLMProviderUsecase } from "./patch-llm-provider";
import { PatchModelUsecase } from "./patch-model";

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

export const deleteModelUsecase = new DeleteModelUsecase(
  new MockModelService(),
);

export const patchModelUsecase = new PatchModelUsecase(new MockModelService());
