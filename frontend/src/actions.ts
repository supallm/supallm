"use server";

import { parse, serialize } from "cookie";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthService, OpenAPI } from "./lib/services/gen-api";
import { LoginRoute } from "./routes";

export async function loginWithEmailAndPassword(
  email: string,
  password: string,
) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!process.env.SUPALLM_INTERNAL_API_URL) {
    throw new Error(
      "SUPALLM_INTERNAL_API_URL is not set but required for the frontend server to communicate with the API.",
    );
  }

  OpenAPI.BASE = process.env.SUPALLM_INTERNAL_API_URL;

  console.log("OpenAPI.BASE", OpenAPI.BASE);

  const authState = await AuthService.login({
    requestBody: {
      email,
      password,
    },
  });

  if (!authState?.user) {
    return { error: "Invalid credentials" };
  }

  const session = {
    user: authState.user,
    token: authState.token,
  };

  const cookieHex = Buffer.from(JSON.stringify(session)).toString("hex");

  const oneWeek = 60 * 60 * 24 * 7;
  const cookie = serialize("session", cookieHex, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: oneWeek,
    path: "/",
  });

  (await cookies()).set("session", cookie);

  return { user: authState.user };
}

export async function logout() {
  (await cookies()).delete("session");

  return redirect(LoginRoute.path());
}

export async function getAuthToken() {
  const cookie = (await cookies()).get("session")?.value;

  if (!cookie) {
    return null;
  }

  const session = parse(cookie)["session"];

  const sessionData = session
    ? JSON.parse(Buffer.from(session, "hex").toString())
    : null;

  return sessionData?.token;
}
