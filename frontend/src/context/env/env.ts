"use server";

import { OpenAPI } from "@/lib/services/gen-api";

export async function getEnv() {
  if (!process.env.PUBLIC_SUPALLM_API_URL) {
    throw new Error("PUBLIC_SUPALLM_API_URL is missing");
  }

  OpenAPI.BASE = process.env.PUBLIC_SUPALLM_API_URL;

  return {
    SUPALLM_API_URL: process.env.PUBLIC_SUPALLM_API_URL,
  };
}
