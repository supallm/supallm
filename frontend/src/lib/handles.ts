import { LabeledHandleType } from "@/components/builder/labeled-handle";
import { toSanitizedCamelCase } from "./utils";

export const generateHandleId = (type: LabeledHandleType, label: string) => {
  const sanitizedLabel = sanitizeHandleLabel(label);
  return `${type}__${sanitizedLabel}`;
};

export const parseHandleId = (id: string) => {
  const [type, label] = id.split("__");

  if (!type || !label) {
    throw new Error(`Invalid handle id. Missing type or label in ${id}`);
  }

  return { type, label };
};

export const sanitizeHandleLabel = (label: string) => {
  return toSanitizedCamelCase(label);
};
