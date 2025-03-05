import { MockCredentialService } from "@/services/mock-credential-service";
import { MockModelService } from "@/services/mock-model-service";
import { MockProjectService } from "@/services/mock-project-service";
import { CreateCredentialUsecase } from "./create-credential";
import { CreateModelUsecase } from "./create-model";
import { DeleteCredentialUsecase } from "./delete-credential";
import { DeleteModelUsecase } from "./delete-model";
import { GetProjectUsecase } from "./get-project";
import { ListCredentialsUsecase } from "./list-credentials";
import { ListModelUsecase } from "./list-models";
import { PatchCredentialUsecase } from "./patch-credential";
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
