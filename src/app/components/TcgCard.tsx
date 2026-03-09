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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sileo } from "sileo";

export interface TcgCardProps {
  name: string;
  price: string;
  priceChange?: number;
  imageUrl: string;
  setCode: string;
  setName?: string | null;
  tcgSlug?: string;
  setSlug?: string;
  rarity?: string;
  change: number;
  quantity?: number;
  cardId?: string;
  cardHref?: string;
  defaultPortfolioId?: string;
}

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function TcgCard({
  name,
  price,
  priceChange,
  imageUrl,
  setCode,
  setName,
  tcgSlug,
  setSlug,
  rarity,
  change,
  quantity = 0,
  cardId,
  cardHref,
  defaultPortfolioId,
}: TcgCardProps) {
  const isPositive = change >= 0;
  const [adding, setAdding] = useState(false);
  const [localQty, setLocalQty] = useState(quantity);
  const router = useRouter();

  useEffect(() => {
    setLocalQty(quantity);
  }, [quantity]);

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!cardId || adding) return;
    if (!defaultPortfolioId) {
      router.push("/login");
      return;
    }
    setAdding(true);
    try {
      await api.collection.add({
        cardId,
        quantity: 1,
        condition: "NM",
        portfolioId: defaultPortfolioId,
      });
      setLocalQty((prev) => prev + 1);
      sileo.success({ title: "Adicionado ao portfólio!" });
    } catch {
      sileo.error({ title: "Erro ao adicionar carta" });
    } finally {
      setAdding(false);
    }
  }

  const setHref =
    tcgSlug && setSlug ? `/sets/${tcgSlug}/${setSlug}` : undefined;

  return (
    <Card className="group w-full h-full overflow-hidden dark:border dark:border-slate-800 bg-card backdrop-blur-sm hover:bg-background/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 py-0">
      <CardContent className="p-0 flex-1">
        {cardHref ? (
          <Link href={cardHref} className="block overflow-hidden p-2">
            <Image
              src={imageUrl}
              alt={name}
              className="w-full rounded-xl aspect-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              width={200}
              height={200}
            />
          </Link>
        ) : (
          <div className="overflow-hidden p-2">
            <Image
              src={imageUrl}
              alt={name}
              className="w-full rounded-xl aspect-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              width={200}
              height={200}
            />
          </div>
        )}
      </CardContent>

      <div className="p-3 space-y-1">
        {cardHref ? (
          <Link href={cardHref}>
            <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 hover:text-primary transition-colors">
              {name}
            </h3>
          </Link>
        ) : (
          <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
            {name}
          </h3>
        )}
        {setName && (
          <>
            {setHref ? (
              <Link
                href={setHref}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-tertiary hover:text-tertiary-hover underline underline-offset-2 truncate leading-tight block transition-colors"
              >
                {setName}
              </Link>
            ) : (
              <p className="text-xs text-tertiary truncate leading-tight">
                {setName}
              </p>
            )}
          </>
        )}

        <p className="text-[10px] text-muted-foreground leading-tight">
          {rarity ? `${rarity} • ${setCode}` : setCode}
        </p>
        <div className="pt-1.5 border-t border-border space-y-0.5 flex justify-between">
          <div className="flex flex-col items-start justify-between gap-2">
            <span className="text-sm font-bold text-foreground font-mono">
              R$ {price}
            </span>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <IconTrendingUp className="size-3 text-emerald-400 shrink-0" />
              ) : (
                <IconTrendingDown className="size-3 text-red-400 shrink-0" />
              )}
              <span
                className={`text-[10px] font-mono ${isPositive ? "text-emerald-400" : "text-red-400"}`}
              >
                {priceChange !== undefined
                  ? `${isPositive ? "+" : ""}R$ ${formatPrice(priceChange)} (${isPositive ? "+" : ""}${change.toFixed(2)}%)`
                  : `${isPositive ? "+" : ""}${change.toFixed(2)}%`}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              Quant. {localQty}
            </span>
          </div>

          <div className="flex items-end">
            {cardId && (
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 size-7 rounded-full border-emerald-500/50 text-muted-foreground hover:text-emerald-400 hover:border-emerald-400 hover:bg-transparent duration-200"
                onClick={handleAdd}
                disabled={adding}
              >
                {adding ? (
                  <IconLoader2 className="size-3.5 animate-spin" />
                ) : (
                  <IconPlus className="size-3.5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
