"use server";

export async function getEnv() {
  if (!process.env.PUBLIC_SUPALLM_API_URL) {
    throw new Error("PUBLIC_SUPALLM_API_URL is missing");
  }

  return {
    SUPALLM_API_URL: process.env.PUBLIC_SUPALLM_API_URL,
  };
}
