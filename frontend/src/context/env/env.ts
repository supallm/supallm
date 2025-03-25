"use server";

export async function getEnv() {
  if (!process.env.NEXT_PUBLIC_SUPALLM_API_URL) {
    throw new Error("NEXT_PUBLIC_SUPALLM_API_URL is missing");
  }

  return {
    SUPALLM_API_URL: process.env.NEXT_PUBLIC_SUPALLM_API_URL,
  };
}
