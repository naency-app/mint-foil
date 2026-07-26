import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Nome de exibição da carta (BR): prefere o nome PT oficial, senão o EN. */
export function cardName(c: { name: string; namePt?: string | null }): string {
  return c.namePt?.trim() || c.name;
}
