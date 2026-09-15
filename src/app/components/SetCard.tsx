"use client";

import { Layers } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CardImage } from "@/app/components/CardImage";
import type { CardSet } from "@/lib/api";

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
  return setCoverCandidates(set)[0] ?? setFanCards(set)[0]?.imageUrl ?? null;
}

/**
 * Logos a tentar, em ordem. Só logo de verdade: imagem de carta não entra aqui,
 * ela vai para o leque (`setFanCards`), que é a capa quando nenhum logo presta.
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

  return [...new Set([set.imageUrl, guess])].filter(
    (u): u is string => !!u && !isCardArtCover(u),
  );
}

/**
 * Cartas do leque, da mais valiosa para a menos. Backend antigo não manda
 * `coverCards`: aí o leque é de uma carta só, a capa derivada que já existia.
 */
function setFanCards(set: CardSet): NonNullable<CardSet["coverCards"]> {
  if (set.coverCards?.length) return set.coverCards.slice(0, 3);
  const unica =
    set.coverFallbackUrl ??
    (set.imageUrl && isCardArtCover(set.imageUrl) ? set.imageUrl : null);
  return unica ? [{ imageUrl: unica }] : [];
}

function isCardArtCover(url: string): boolean {
  return url.includes("tcgplayer-cdn.tcgplayer.com/product/");
}

/**
 * Logo quebrado nem sempre dá erro. O pokemontcg.io responde 404 com um PNG de
 * 640×892 (o verso da carta) e o sbrauble responde 200 com um ícone de 20×19.
 * Logo de coleção é paisagem e tem tamanho de gente: imagem em pé ou minúscula
 * é página de erro. Mesma regra do app e do `image-probe.ts` do backend.
 */
function logoPareceQuebrado(w: number, h: number): boolean {
  if (!w || !h) return false; // SVG pode chegar sem medida: na dúvida, aceita
  return h > w || w < 64;
}

// [mais cara, 2ª, 3ª] → meio (por cima), esquerda, direita
const FAN_POSITIONS = [
  "z-[3] -translate-y-0.5",
  "z-[2] -translate-x-[62%] translate-y-1 -rotate-10",
  "z-[1] translate-x-[62%] translate-y-1 rotate-10",
];

export function SetCard({ set, progress, onClick }: SetCardProps) {
  const total = set.totalCards ?? set._count?.cards ?? 0;
  const collected = progress?.count ?? 0;
  const pct = total > 0 ? Math.min(collected / total, 1) : 0;
  // Avança nos logos a cada falha; esgotados, entra o leque de cartas, e só sem
  // cartas cai no logo do TCG (e, sem ele, no ícone)
  const logos = useMemo(() => setCoverCandidates(set), [set]);
  const fan = useMemo(() => setFanCards(set), [set]);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => setAttempt(0), [set.id]);
  const logoUrl = logos[attempt] ?? null;
  // O logo só cobre o leque depois de carregar E passar na checagem — mesmo
  // comportamento do app, onde o erro de rede às vezes nunca chega como evento
  const [logoPronto, setLogoPronto] = useState(false);
  useEffect(() => setLogoPronto(false), [logoUrl]);
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
      className="glass-card group relative flex h-full w-full cursor-pointer flex-col justify-between overflow-hidden !rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div>
        <div className="relative aspect-video w-full bg-muted flex items-center justify-center overflow-hidden p-3 border-b border-border">
          {logoUrl && (
            <Image
              key={logoUrl}
              src={logoUrl}
              alt={set.name}
              fill
              sizes="(max-w-768px) 100vw, 300px"
              className={`z-[5] object-cover transition-transform duration-300 group-hover:scale-[1.012] ${
                logoPronto ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              onLoad={(e) => {
                const img = e.currentTarget;
                if (logoPareceQuebrado(img.naturalWidth, img.naturalHeight)) {
                  setAttempt((n) => n + 1);
                } else {
                  setLogoPronto(true);
                }
              }}
              onError={() => setAttempt((n) => n + 1)}
            />
          )}

          {/* Base: sempre visível até um logo provar que presta */}
          {logoPronto ? null : fan.length > 0 ? (
            // Carta é retrato e o container é 16:9: uma carta só sobra como tira
            // no meio do vazio; três abertas em leque ocupam a largura
            <div className="absolute inset-0 flex items-center justify-center">
              {fan.map((carta, i) => (
                <div
                  key={`${carta.imageUrl}-${i}`}
                  className={`absolute h-[84%] aspect-[5/7] overflow-hidden rounded-[4px] shadow-md transition-transform duration-300 group-hover:scale-[1.03] ${FAN_POSITIONS[i]}`}
                >
                  <CardImage
                    carta={carta}
                    tamanho="miniatura"
                    alt={i === 0 ? set.name : ""}
                    fill
                    sizes="120px"
                    className="object-cover"
                    rotulo={false}
                  />
                </div>
              ))}
            </div>
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
            <span className="absolute top-2 right-2 z-[4] px-2 py-0.5 rounded-md text-[10px] font-medium bg-background/80 backdrop-blur-sm border border-border text-muted-foreground uppercase">
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
