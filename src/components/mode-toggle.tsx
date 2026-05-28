"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-9 h-9 rounded-xl bg-transparent border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border hover:scale-[1.05] active:scale-[0.97] transition-all duration-300 ease-out cursor-pointer"
      aria-label="Alternar tema"
    >
      <IconSun size={18} className="hidden dark:block" />
      <IconMoon size={18} className="block dark:hidden" />
    </button>
  );
}
