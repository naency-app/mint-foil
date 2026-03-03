"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import {
  IconLoader2,
  IconPlus,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";
import { sileo } from "sileo";

export interface TcgCardProps {
  name: string;
  price: string;
  imageUrl: string;
  setCode: string;
  change: number;
  cardId?: string;
  defaultPortfolioId?: string;
}

export function TcgCard({
  name,
  price,
  imageUrl,
  setCode,
  change,
  cardId,
  defaultPortfolioId,
}: TcgCardProps) {
  const isPositive = change >= 0;
  const [adding, setAdding] = useState(false);

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!cardId || !defaultPortfolioId || adding) return;
    setAdding(true);
    try {
      await api.collection.add({
        cardId,
        quantity: 1,
        condition: "NM",
        portfolioId: defaultPortfolioId,
      });
      sileo.success({ title: "Adicionado ao portfólio!" });
    } catch {
      sileo.error({ title: "Erro ao adicionar carta" });
    } finally {
      setAdding(false);
    }
  }

  return (
    <Card className="group w-full h-full overflow-hidden dark:border dark:border-slate-800 bg-card backdrop-blur-sm hover:bg-background/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 py-0">
      <CardContent className="p-0 flex-1">
        <div className="overflow-hidden p-2">
          <Image
            src={imageUrl}
            alt={name}
            className="w-full rounded-xl aspect-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            width={200}
            height={200}
          />
        </div>
      </CardContent>

      <div className="p-3 space-y-1.5">
        <h3 className="text-md font-bold text-foreground truncate leading-tight">
          {name}
        </h3>
        <p className="text-xs text-muted-foreground leading-tight">{setCode}</p>
        <div className="pt-1 border-t border-border">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 min-w-0">
              {isPositive ? (
                <IconTrendingUp className="size-4 text-emerald-400 shrink-0" />
              ) : (
                <IconTrendingDown className="size-4 text-red-400 shrink-0" />
              )}
              <span className="text-sm font-bold text-foreground font-mono truncate">
                R$ {price}
              </span>
              {change !== 0 && (
                <span
                  className={`text-[10px] font-mono font-medium shrink-0 ${
                    isPositive ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
              )}
            </div>

            {cardId && (
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 size-7 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-200 duration-300 "
                onClick={handleAdd}
                disabled={adding || !defaultPortfolioId}
              >
                {adding ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  <IconPlus className="size-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
