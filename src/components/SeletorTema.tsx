"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { TEMAS } from "@/lib/temas";
import { cn } from "@/lib/utils";

/**
 * Seletor de tema com as 3 opções canônicas (Claro, Escuro e Mint).
 * Apresentado como controle segmentado em pílula de alta fidelidade visual.
 */
export function SeletorTema({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "grid grid-cols-3 gap-1 rounded-2xl bg-muted/40 p-1 border border-border/40",
          className,
        )}
      >
        {TEMAS.map((opt) => (
          <div
            key={opt.value}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold text-transparent select-none"
          >
            <opt.icon className="size-4 opacity-0" />
            <span>{opt.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Selecionar aparência"
      className={cn(
        "grid grid-cols-3 gap-1 rounded-2xl bg-muted/40 p-1 border border-border/50",
        className,
      )}
    >
      {TEMAS.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none",
              active
                ? "bg-background text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40",
            )}
          >
            <opt.icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                active && opt.value === "mint"
                  ? "text-primary"
                  : active
                    ? "text-foreground"
                    : "text-muted-foreground",
              )}
            />
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
