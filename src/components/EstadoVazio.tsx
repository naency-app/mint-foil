import type * as React from "react";
import { IconStack, type IconStackColor } from "@/components/ui/icon-stack";
import { cn } from "@/lib/utils";

/**
 * Todo estado vazio do produto (lista sem itens, busca sem resultado, coleção
 * sem cartas) passa por aqui, SEMPRE com a pilha de placas do IconStack — em
 * página, em card, com ou sem botões (31/10: a versão "só o ícone apagado"
 * para vazio dentro de card saiu; não era o padrão).
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
      <IconStack size="md" color={cor} className="mb-4">
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
