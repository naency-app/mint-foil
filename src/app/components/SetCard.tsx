"use client";

import { type CardSet } from "@/lib/api";
import { Layers } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

/**
 * Último recurso quando nenhuma capa carrega — mesmo comportamento do app
 * (`components/set-card.tsx`), para o estado vazio ser idêntico nas duas
 * plataformas. Lorcana e Digimon ainda não têm logo em nenhuma das duas.
 */
const TCG_LOGOS: Record<string, string> = {
  pokemon: "/logos/pokemon.webp",
  magic: "/logos/magic.webp",
  yugioh: "/logos/yugioh.webp",
  onepiece: "/logos/one-piece.webp",
};

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
  return setCoverCandidates(set)[0] ?? null;
}

/**
 * Capas a tentar, em ordem. O grid nunca deve cair no ícone vazio, então há
 * sempre uma segunda opção: `coverFallbackUrl` é a carta mais valiosa do set,
 * servida pelo mesmo CDN de que todas as cartas do app já dependem.
 *
 * O palpite por código de CDN fica por último de propósito: ele monta a URL com
 * o nosso `code` (que vem da TCGCSV), enquanto pokemontcg.io/Scryfall/YGOPRODeck
 * indexam por código próprio — erra na maioria das vezes.
 */
export function setCoverCandidates(set: CardSet): string[] {
  const code = set.code.toLowerCase();
  const tcg = set.tcg?.slug;
  const guess =
    tcg === "pokemon"
      ? `https://images.pokemontcg.io/${code}/logo.png`
      : tcg === "magic"
        ? `https://svgs.scryfall.io/sets/${code}.svg`
        : tcg === "yugioh"
          ? `https://images.ygoprodeck.com/images/sets/${set.code.toUpperCase()}.jpg`
          : null;

  return [set.imageUrl, set.coverFallbackUrl, guess].filter(
    (u): u is string => !!u,
  );
}

/**
 * Sets sem logo de CDN (One Piece, Lorcana, Digimon) recebem no backfill a
 * imagem da carta mais valiosa como capa. Carta é retrato: com object-cover o
 * aspect-video cortaria uma tira do meio. Essas ficam contidas.
 */
function isCardArtCover(url: string): boolean {
  return url.includes("tcgplayer-cdn.tcgplayer.com/product/");
}

export function SetCard({ set, progress, onClick }: SetCardProps) {
  const total = set.totalCards ?? set._count?.cards ?? 0;
  const collected = progress?.count ?? 0;
  const pct = total > 0 ? Math.min(collected / total, 1) : 0;
  // Avança na lista de candidatas a cada erro; só o esgotamento mostra o ícone
  const candidates = useMemo(() => setCoverCandidates(set), [set]);
  const [attempt, setAttempt] = useState(0);
  const cdnUrl = candidates[attempt] ?? null;
  const tcgLogo = set.tcg?.slug ? (TCG_LOGOS[set.tcg.slug] ?? null) : null;

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
          {cdnUrl ? (
            <Image
              key={cdnUrl}
              src={cdnUrl}
              alt={set.name}
              fill
              sizes="(max-w-768px) 100vw, 300px"
              className={`transition-transform duration-500 group-hover:scale-105 ${
                isCardArtCover(cdnUrl) ? "object-contain p-1" : "object-cover"
              }`}
              loading="lazy"
              onError={() => setAttempt((n) => n + 1)}
            />
          ) : tcgLogo ? (
            <Image
              src={tcgLogo}
              alt={set.tcg?.name ?? set.name}
              width={120}
              height={68}
              className="max-h-[60%] w-auto object-contain opacity-80"
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
