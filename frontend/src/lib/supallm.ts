import { initSupallm } from "supallm";

export const supallm = initSupallm({
  projectUrl: "http://localhost:3001/3ac02582-79ae-40fe-92b0-26e72383a564",
  publicKey: process.env.SUPALLM_PUBLIC_KEY!,
});
