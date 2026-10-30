"use client";

import type { ProductTypeValue } from "@/app/components/filters";
import { cn } from "@/lib/utils";

/**
 * Tudo · Cartas · Selados, com a contagem de cada um, no desenho do
 * AlternarVisao (botão dividido). No portfólio, só aparece quando há selado:
 * sem selado, "Cartas" e "Tudo" seriam a mesma lista (30/10).
 */
export function AlternarTipoDeProduto({
  valor,
  onChange,
  contagem,
  className,
}: {
  valor: ProductTypeValue;
  onChange: (v: ProductTypeValue) => void;
  contagem: { cartas: number; selados: number };
  className?: string;
}) {
  const opcoes: { value: ProductTypeValue; label: string; n: number }[] = [
    { value: "all", label: "Tudo", n: contagem.cartas + contagem.selados },
    { value: "single", label: "Cartas", n: contagem.cartas },
    { value: "sealed", label: "Selados", n: contagem.selados },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Tipo de produto"
      className={cn(
        "glass-pill inline-flex h-8 shrink-0 items-center gap-0.5 rounded-full p-0.5",
        className,
      )}
    >
      {opcoes.map((opt) => {
        const ativo = valor === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex h-full cursor-pointer items-center gap-1 rounded-full px-3 text-xs font-bold transition-all",
              ativo
                ? "border border-border/60 bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
            <span className="font-mono font-medium opacity-60">{opt.n}</span>
          </button>
        );
      })}
    </div>
  );
}
