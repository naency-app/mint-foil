"use client";

import { Trophy } from "lucide-react";
import Link from "next/link";
import { CardImage } from "@/app/components/CardImage";
import type { UserStats } from "@/lib/api";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Insights da coleção — "Top cartas" e "Por jogo", como no Portfólio do app
 * (components/collection-insights.tsx). Ficavam na aba de estatísticas dos
 * Ajustes, onde o app também tinha antes de levar pro Portfólio.
 */
export function CollectionInsights({ stats }: { stats: UserStats | null }) {
  if (!stats) return null;
  const topCards = stats.topCards.slice(0, 3);
  // Proporção sobre a soma dos jogos, como no app: o totalValue inclui
  // selados, e a barra de cada jogo nunca fecharia 100%
  const totalJogos = stats.tcgBreakdown.reduce((s, t) => s + t.value, 0);
  if (!topCards.length && !stats.tcgBreakdown.length) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {topCards.length > 0 && (
        <div className="glass-card !rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Top cartas
            </h3>
          </div>
          <div className="space-y-3">
            {topCards.map((card, i) => (
              <Link
                key={card.id}
                href={`/card/${card.id}`}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-background hover:bg-muted/40 transition-colors"
              >
                <span className="text-xs font-mono font-bold text-muted-foreground w-4 text-center">
                  #{i + 1}
                </span>
                <div className="relative size-10 rounded overflow-hidden shrink-0 border border-border bg-muted">
                  <CardImage
                    carta={card}
                    tamanho="grade"
                    alt={card.name}
                    fill
                    rotulo={false}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {card.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {card.collectorNumber ?? card.setCode} • ×{card.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold text-primary font-mono">
                  {formatPrice(card.totalValue)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {stats.tcgBreakdown.length > 0 && (
        <div className="glass-card !rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Por jogo
          </h3>
          <div className="space-y-4">
            {stats.tcgBreakdown.map((tcg) => {
              const pct = totalJogos > 0 ? (tcg.value / totalJogos) * 100 : 0;
              return (
                <div key={tcg.slug} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      {tcg.name}
                    </span>
                    <span className="text-muted-foreground font-mono">
                      {formatPrice(tcg.value)} • {tcg.count}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
