import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toCamelCase = (str: string) => {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (+match === 0) return "";
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
};

export const sanitizeString = (str: string) => {
  return str.replace(/[^a-zA-Z-0-9]/g, "");
};

export const toSanitizedCamelCase = (str: string) => {
  return sanitizeString(toCamelCase(str));
};

export const assertUnreachable = (x: never): never => {
  throw new Error(
    "Unreachable code. If you see this, it means your type is not exhaustive.",
  );
};
