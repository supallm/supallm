import { getAuthToken } from "@/actions";
import { OpenAPI } from "./index";
import { getEnv } from "@/context/env/env";

/* We can overwrite the default configuration by exporting a getToken function.
 * This function will be called before each request to get a token.
 * See: https://github.com/ferdikoomen/openapi-typescript-codegen/blob/master/docs/authorization.md
 */
export const getToken = async () => {
  const result = await getAuthToken();

  if (!result) {
    return "";
  }
  return result;
};

OpenAPI.TOKEN = getToken;
OpenAPI.BASE = process?.env?.NEXT_PUBLIC_SUPALLM_API_URL ?? "undefined";
