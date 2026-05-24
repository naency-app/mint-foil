"use client";

import { type CardSet } from "@/lib/api";
import { Layers } from "lucide-react";
import { useMemo } from "react";

export interface SetProgress {
  count: number;
  value: number;
}

interface SetCardProps {
  set: CardSet;
  progress?: SetProgress | null;
  onClick?: () => void;
}

export function getSetImageUrl(set: CardSet): string | null {
  if (set.imageUrl) return set.imageUrl;
  const code = set.code.toLowerCase();
  const tcg = set.tcg?.slug;
  if (tcg === "pokemon") return `https://images.pokemontcg.io/${code}/logo.png`;
  if (tcg === "magic") return `https://svgs.scryfall.io/sets/${code}.svg`;
  if (tcg === "yugioh") return `https://images.ygoprodeck.com/images/sets/${set.code.toUpperCase()}.jpg`;
  return null;
}

export function SetCard({ set, progress, onClick }: SetCardProps) {
  const total = set.totalCards ?? set._count?.cards ?? 0;
  const collected = progress?.count ?? 0;
  const pct = total > 0 ? Math.min(collected / total, 1) : 0;
  const cdnUrl = getSetImageUrl(set);

  const relDate = useMemo(() => {
    if (!set.releaseDate) return null;
    try {
      return new Date(set.releaseDate).toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return null;
    }
  }, [set.releaseDate]);

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card backdrop-blur-sm shadow-sm hover:shadow-md hover:border-slate-400 dark:hover:border-slate-700 hover:-translate-y-0.5 hover:bg-background/50 transition-all duration-300 cursor-pointer w-full h-full"
    >
      <div>
        {/* Set Image Container */}
        <div className="relative aspect-video w-full bg-muted flex items-center justify-center overflow-hidden p-3 border-b border-border">
          {cdnUrl ? (
            <img
              src={cdnUrl}
              alt={set.name}
              className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <Layers className="size-8 text-muted-foreground stroke-[1.5]" />
          )}

          {/* Date Badge */}
          {relDate && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-medium bg-background/80 backdrop-blur-sm border border-border text-muted-foreground uppercase">
              {relDate}
            </span>
          )}
        </div>

        {/* Set Info */}
        <div className="p-3">
          <h4 className="text-xs font-semibold text-tertiary truncate uppercase tracking-wider font-mono">
            {set.code}
          </h4>
          <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 min-h-[2.5rem] mt-0.5">
            {set.name}
          </h3>
        </div>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="p-3 pt-0 mt-auto">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${pct * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap font-mono">
              {collected}/{total}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
