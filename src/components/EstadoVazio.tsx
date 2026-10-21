import type * as React from "react";
import { IconStack, type IconStackColor } from "@/components/ui/icon-stack";
import { cn } from "@/lib/utils";

/**
 * Todo estado vazio do produto (lista sem itens, busca sem resultado, coleção
 * sem cartas) passa por aqui, com a pilha de placas do IconStack como arte —
 * regra do usuário (21/10): nada de ícone solto nem texto sozinho.
 *
 * `emCard` põe dentro do vidro dos cards, para o vazio que fica no lugar de
 * uma grade; sem ele, o vazio ocupa a página.
 */
export function EstadoVazio({
  icon,
  titulo,
  descricao,
  cor = "neutral",
  emCard = false,
  className,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  titulo: React.ReactNode;
  descricao?: React.ReactNode;
  cor?: IconStackColor;
  emCard?: boolean;
  className?: string;
  /** Ações (botões, links) embaixo do texto */
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        emCard ? "glass-card !rounded-2xl p-12" : "py-20",
        className,
      )}
    >
      <IconStack size="lg" color={cor} className="mb-5">
        <IconStack.Icon icon={icon} />
      </IconStack>
      <h3 className="mb-1 text-lg font-semibold text-foreground">{titulo}</h3>
      {descricao && (
        <p className="max-w-sm text-sm text-muted-foreground">{descricao}</p>
      )}
      {children && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
