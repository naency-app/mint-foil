import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Nome de exibição da carta (BR): prefere o nome PT oficial, senão o EN. */
export function cardName(c: { name: string; namePt?: string | null }): string {
  return c.namePt?.trim() || c.name;
}

/**
 * Nome em inglês para mostrar embaixo do PT ("Pequena Maga Negra" / "Dark
 * Magician Girl"), como no app. `null` quando não há PT ou é igual ao EN.
 */
export function cardNameEn(c: { name: string; namePt?: string | null }): string | null {
  const pt = c.namePt?.trim();
  return pt && pt.toLowerCase() !== c.name.toLowerCase() ? c.name : null;
}
