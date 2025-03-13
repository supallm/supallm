import { initSupallm } from "supallm";

export const supallm = initSupallm({
  projectUrl: "https://myproject.supallm.com",
  publicKey: process.env.SUPALLM_PUBLIC_KEY!,
});
