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
  return str.replace(/[^a-zA-Z]/g, "");
};

export const toSanitizedCamelCase = (str: string) => {
  return sanitizeString(toCamelCase(str));
};
