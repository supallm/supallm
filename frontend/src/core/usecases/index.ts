import { ApiCredentialService } from "@/services/api-credential-service";
import { ApiFlowService } from "@/services/api-flow-service";
import { ApiProjectService } from "@/services/api-project-service";
import { MockAuthProviderService } from "@/services/mock-auth-provider-service";
import { CreateAuthProviderUsecase } from "./create-auth-provider";
import { CreateCredentialUsecase } from "./create-credential";
import { CreateFlowUsecase } from "./create-flow";
import { CreateProjectUsecase } from "./create-project";
import { DeleteAuthProviderUsercase } from "./delete-auth-provider";
import { DeleteCredentialUsecase } from "./delete-credential";
import { DeleteFlowUsecase } from "./delete-flow";
import { GetCurrentProjectUsecase } from "./get-current-project";
import { GetFlowUsecase } from "./get-flow";
import { ListAuthProvidersUsecase } from "./list-auth-providers";
import { ListCredentialsUsecase } from "./list-credentials";
import { ListFlowsUsecase } from "./list-flows";
import { ListProjectsUsecase } from "./list-projects";
import { PatchAuthProviderUsecase } from "./patch-auth-provider";
import { PatchCredentialUsecase } from "./patch-credential";
import { PatchFlowUsecase } from "./patch-flow";

/**
 * Project
 */
export const getCurrentProjectUsecase = new GetCurrentProjectUsecase(
  new ApiProjectService(),
);

export const listProjectsUsecase = new ListProjectsUsecase(
  new ApiProjectService(),
);

export const createProjectUsecase = new CreateProjectUsecase(
  new ApiProjectService(),
);

/**
 * Credentials
 */
export const listCredentialsUsecase = new ListCredentialsUsecase(
  new ApiCredentialService(),
);

export const createCredentialUsecase = new CreateCredentialUsecase(
  new ApiCredentialService(),
);

export const patchCredentialUsecase = new PatchCredentialUsecase(
  new ApiCredentialService(),
);

export const deleteCredentialUsecase = new DeleteCredentialUsecase(
  new ApiCredentialService(),
);

/**
 * Flows
 */

export const createFlowUsecase = new CreateFlowUsecase(new ApiFlowService());

export const patchFlowUsecase = new PatchFlowUsecase(new ApiFlowService());

export const getFlowUsecase = new GetFlowUsecase(new ApiFlowService());

export const listFlowsUsecase = new ListFlowsUsecase(new ApiFlowService());

export const deleteFlowUsecase = new DeleteFlowUsecase(new ApiFlowService());

/**
 * Auth Providers
 */
export const listAuthProvidersUsecase = new ListAuthProvidersUsecase(
  new MockAuthProviderService(),
);

export const deleteAuthProviderUsecase = new DeleteAuthProviderUsercase(
  new MockAuthProviderService(),
);

export const createAuthProviderUsecase = new CreateAuthProviderUsecase(
  new MockAuthProviderService(),
);

export const patchAuthProviderUsecase = new PatchAuthProviderUsecase(
  new MockAuthProviderService(),
);
