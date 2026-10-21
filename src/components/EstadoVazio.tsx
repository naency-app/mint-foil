import type * as React from "react";
import { IconStack, type IconStackColor } from "@/components/ui/icon-stack";
import { cn } from "@/lib/utils";

/**
 * Todo estado vazio do produto (lista sem itens, busca sem resultado, coleção
 * sem cartas) passa por aqui, com a pilha de placas do IconStack como arte —
 * regra do usuário (21/10): nada de ícone solto nem texto sozinho.
 *
 * Ações: BotaoFoil para a principal e GlassPill para a secundária, o padrão
 * do sistema.
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
  compacto = false,
  className,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  titulo: React.ReactNode;
  descricao?: React.ReactNode;
  cor?: IconStackColor;
  emCard?: boolean;
  /** Ícone menor, para o vazio dentro de um gráfico ou de um card pequeno */
  compacto?: boolean;
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
      <IconStack
        size={compacto ? "sm" : "md"}
        color={cor}
        className={compacto ? "mb-3" : "mb-4"}
      >
        <IconStack.Icon icon={icon} />
      </IconStack>
      {/* Texto discreto, em cinza: o vazio informa, não chama atenção
          (pedido do usuário, 21/10, a partir do antigo "Histórico em
          construção") */}
      <h3 className="text-sm font-medium text-muted-foreground">{titulo}</h3>
      {descricao && (
        <p className="mt-1 max-w-xs text-xs text-muted-foreground/70">
          {descricao}
        </p>
      )}
      {children && (
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
