import { MockCredentialService } from "@/services/mock-credential-service";
import { MockModelService } from "@/services/mock-model-service";
import { MockProjectService } from "@/services/mock-project-service";
import { CreateCredentialUsecase } from "./create-credential";
import { CreateModelUsecase } from "./create-model";
import { CreateProjectUsecase } from "./create-project";
import { DeleteCredentialUsecase } from "./delete-credential";
import { DeleteModelUsecase } from "./delete-model";
import { GetCurrentProjectUsecase } from "./get-current-project";
import { ListCredentialsUsecase } from "./list-credentials";
import { ListModelUsecase } from "./list-models";
import { ListProjectsUsecase } from "./list-projects";
import { PatchCredentialUsecase } from "./patch-credential";
import { PatchModelUsecase } from "./patch-model";

/**
 * Project
 */
export const getCurrentProjectUsecase = new GetCurrentProjectUsecase(
  new MockProjectService(),
);

export const listProjectsUsecase = new ListProjectsUsecase(
  new MockProjectService(),
);

export const createProjectUsecase = new CreateProjectUsecase(
  new MockProjectService(),
);

/**
 * Credentials
 */
export const listCredentialsUsecase = new ListCredentialsUsecase(
  new MockCredentialService(),
);

export const createCredentialUsecase = new CreateCredentialUsecase(
  new MockCredentialService(),
);

export const patchCredentialUsecase = new PatchCredentialUsecase(
  new MockCredentialService(),
);

export const deleteCredentialUsecase = new DeleteCredentialUsecase(
  new MockCredentialService(),
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
