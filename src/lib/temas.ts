import { IconMoon, IconSparkles, IconSun } from "@tabler/icons-react";

/**
 * Temas da web (Aparência no menu do avatar e em Configurações). O Mint é o
 * escuro com o fundo foil (FundoFoil); as cores dele são as do escuro. É o
 * tema padrão (defaultTheme em provider.tsx).
 */
export const TEMAS = [
  { value: "light", label: "Claro", icon: IconSun },
  { value: "dark", label: "Escuro", icon: IconMoon },
  { value: "mint", label: "Mint", icon: IconSparkles },
] as const;
