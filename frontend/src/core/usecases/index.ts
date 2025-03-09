import { MockCredentialService } from "@/services/mock-credential-service";
import { MockFlowService } from "@/services/mock-flow-service";
import { MockModelService } from "@/services/mock-model-service";
import { MockProjectService } from "@/services/mock-project-service";
import { CreateCredentialUsecase } from "./create-credential";
import { CreateFlowUsecase } from "./create-flow";
import { CreateModelUsecase } from "./create-model";
import { CreateProjectUsecase } from "./create-project";
import { DeleteCredentialUsecase } from "./delete-credential";
import { DeleteFlowUsecase } from "./delete-flow";
import { DeleteModelUsecase } from "./delete-model";
import { GetCurrentProjectUsecase } from "./get-current-project";
import { GetFlowUsecase } from "./get-flow";
import { ListCredentialsUsecase } from "./list-credentials";
import { ListFlowsUsecase } from "./list-flows";
import { ListModelUsecase } from "./list-models";
import { ListProjectsUsecase } from "./list-projects";
import { PatchCredentialUsecase } from "./patch-credential";
import { PatchFlowUsecase } from "./patch-flow";
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

/**
 * Flows
 */

export const createFlowUsecase = new CreateFlowUsecase(new MockFlowService());

export const patchFlowUsecase = new PatchFlowUsecase(new MockFlowService());

export const getFlowUsecase = new GetFlowUsecase(new MockFlowService());

export const listFlowsUsecase = new ListFlowsUsecase(new MockFlowService());

export const deleteFlowUsecase = new DeleteFlowUsecase(new MockFlowService());
