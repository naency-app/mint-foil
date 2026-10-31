"use client";

import { cn } from "@/lib/utils";

/**
 * Botão dividido em segmentos (o desenho do AlternarVisao): um ativo por vez,
 * com contagem opcional ao lado do rótulo. Usado no tipo de produto do
 * portfólio e nas abas do gráfico de preço da carta (31/10).
 */
export function AlternarSegmento<T extends string>({
  valor,
  onChange,
  opcoes,
  rotulo,
  className,
}: {
  valor: T;
  onChange: (v: T) => void;
  opcoes: { value: T; label: string; n?: number }[];
  /** Nome do grupo para leitores de tela */
  rotulo: string;
  className?: string;
}) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: grupo de botões no desenho do AlternarVisao; um fieldset traria borda e margem do navegador
    <div
      role="radiogroup"
      aria-label={rotulo}
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
            {opt.n != null && (
              <span className="font-mono font-medium opacity-60">{opt.n}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
