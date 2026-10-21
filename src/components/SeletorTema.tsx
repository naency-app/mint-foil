"use client";

import { IconDeviceDesktop } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { TEMAS } from "@/lib/temas";
import { cn } from "@/lib/utils";

const OPCOES = [
  ...TEMAS,
  { value: "system", label: "Sistema", icon: IconDeviceDesktop },
] as const;

/**
 * Botões de tema (Claro, Escuro, Mint, Sistema): Configurações e o menu do
 * celular. O menu do avatar no computador usa um submenu, com a mesma lista
 * TEMAS.
 */
export function SeletorTema({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // O tema salvo só existe no navegador: antes de montar, o servidor não sabe
  // qual botão acender.
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {OPCOES.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <opt.icon className="size-4" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
