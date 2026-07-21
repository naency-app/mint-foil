"use client";

import { type CardSet } from "@/lib/api";
import { Layers } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

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
  if (tcg === "yugioh")
    return `https://images.ygoprodeck.com/images/sets/${set.code.toUpperCase()}.jpg`;
  return null;
}

export function SetCard({ set, progress, onClick }: SetCardProps) {
  const total = set.totalCards ?? set._count?.cards ?? 0;
  const collected = progress?.count ?? 0;
  const pct = total > 0 ? Math.min(collected / total, 1) : 0;
  const cdnUrl = getSetImageUrl(set);
  const [imgFailed, setImgFailed] = useState(false);

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
      className="glass-card group relative flex h-full w-full cursor-pointer flex-col justify-between overflow-hidden !rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div>
        <div className="relative aspect-video w-full bg-muted flex items-center justify-center overflow-hidden p-3 border-b border-border">
          {cdnUrl && !imgFailed ? (
            <Image
              src={cdnUrl}
              alt={set.name}
              fill
              sizes="(max-w-768px) 100vw, 300px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => setImgFailed(true)}
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
            <div className="flex-1 bg-border rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
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
