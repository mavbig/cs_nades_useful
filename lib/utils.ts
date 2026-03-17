import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeMapName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '');
}
