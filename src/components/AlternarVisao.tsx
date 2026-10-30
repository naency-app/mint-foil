"use client";

import { IconLayoutGrid, IconListDetails } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type Visao = "grid" | "list";

const OPCOES = [
  { value: "grid", label: "Visualizar em grade", icon: IconLayoutGrid },
  { value: "list", label: "Visualizar em lista", icon: IconListDetails },
] as const;

/**
 * Grade ou lista num controle só, dividido ao meio como o seletor de tema:
 * eram dois botões soltos, e o branco do ativo parecia um botão a mais
 * competindo com o resto da barra (30/10). Portfólio e perfil público usam
 * este.
 */
export function AlternarVisao({
  valor,
  onChange,
  className,
}: {
  valor: Visao;
  onChange: (v: Visao) => void;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Visualização"
      className={cn(
        "glass-pill inline-flex h-8 shrink-0 items-center gap-0.5 rounded-full p-0.5",
        className,
      )}
    >
      {OPCOES.map((opt) => {
        const ativo = valor === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={ativo}
            aria-label={opt.label}
            title={opt.label}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex h-full cursor-pointer items-center justify-center rounded-full px-2.5 transition-all",
              ativo
                ? "border border-border/60 bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <opt.icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
