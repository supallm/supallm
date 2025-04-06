"use server";

export async function getEnv() {
  if (!process.env.SUPALLM_PUBLIC_API_URL) {
    throw new Error(
      "SUPALLM_PUBLIC_API_URL is missing but required for the frontend browser side to communicate with the backend.",
    );
  }

  return {
    SUPALLM_API_URL: process.env.SUPALLM_PUBLIC_API_URL,
  };
}
