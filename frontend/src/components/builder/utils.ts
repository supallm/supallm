import { z } from "zod";

export const strictToolNameRule = z
  .string()
  .regex(/^[a-zA-Z0-9_-]+$/, {
    message:
      "Only alphanumeric characters, underscores, and hyphens are allowed.",
  })
  .refine((value) => !/___/.test(value), {
    message: "Cannot contain more than two consecutive underscores.",
  });
