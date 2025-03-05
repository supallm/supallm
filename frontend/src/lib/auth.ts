// import { auth } from "@clerk/nextjs/server";

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => string;
      };
    };
  }
}

export async function getAuthToken() {
  const isServer = typeof window === "undefined";

  if (isServer) {
    return null;
  }

  // if (isServer) {
  //   const { getToken } = await auth();
  //   return await getToken();
  // }

  const token = window.Clerk?.session?.getToken() ?? null;

  return token;
}
