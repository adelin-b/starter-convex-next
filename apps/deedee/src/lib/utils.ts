import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Theme constants
const _THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";
const _THEME_STORAGE_KEY = "theme";
