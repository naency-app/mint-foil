"use client";

import Link from "next/link";
import { ConviteAppFaixa } from "@/app/components/ConviteApp";
import { Badge } from "@/components/ui/badge";
import { TCG_CATALOG } from "@/lib/tcg-catalog";

/**
 * Quadro do jogo com o mesmo vidro dos cards do sistema no escuro e no Mint
 * (cor, borda e blur do tema). No claro não: as artes são feitas para fundo
 * escuro e os logos brancos (Magic, One Piece, Star Wars) sumiam no vidro
 * branco. A arte já traz um quadro próprio, cinza a 7% com cantos de ~24px
 * numa imagem de 317×200: o arredondamento em porcentagem acompanha esse
 * quadro em qualquer largura.
 */
const VIDRO_DO_QUADRO =
  "rounded-[7.6%/12%] dark:border dark:border-white/10 dark:bg-[var(--glass-bg)] dark:[backdrop-filter:var(--glass-blur)]";

export default function SetsPage() {
  return (
    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Coleções / Sets</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha um TCG para explorar seus sets, expansões e acompanhar o
          progresso de sua coleção.
        </p>
      </div>

      <ConviteAppFaixa
        id="sets"
        titulo="Complete suas coleções pelo app"
        texto="Escaneie as cartas que você tem e veja na hora quanto falta para fechar cada coleção."
      />

      {/*
        Seis colunas na largura cheia: são ~19 TCGs, e em quatro colunas a lista
        virava cinco fileiras de cards enormes — muita rolagem para o que é só uma
        escolha de jogo. O gap também encolhe, porque com tile menor o respiro de
        24px separava mais do que agrupava.
      */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {TCG_CATALOG.map((item) => {
          if (!item.supported) {
            return (
              <div
                key={item.categoryId}
                className={`group relative aspect-[1.6] w-full select-none overflow-hidden opacity-45 ${VIDRO_DO_QUADRO}`}
              >
                {/* biome-ignore lint/performance/noImgElement: artes locais dos TCGs, sem otimização necessária */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover grayscale"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-end justify-end p-3">
                  <Badge
                    variant="outline"
                    className="h-4 bg-background/80 px-1.5 font-mono text-[9px] uppercase leading-none tracking-wider backdrop-blur-sm"
                  >
                    Breve
                  </Badge>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.categoryId}
              href={`/sets/${item.slug}`}
              className={`group relative block aspect-[1.6] w-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 ${VIDRO_DO_QUADRO}`}
            >
              {/* biome-ignore lint/performance/noImgElement: artes locais dos TCGs, sem otimização necessária */}
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.012]"
                loading="lazy"
              />
            </Link>
          );
        })}
      </div>
    </main>
  );
}
