import type { CSSProperties, ReactNode } from "react";

import { findCoverPreset } from "@/lib/cover-catalog";

export type CoverType = "gradient" | "color" | "preset" | "image";

export interface Cover {
  type: CoverType;
  value: string | null;
}

/**
 * Capa full-bleed do perfil (compartilhada por /showcase e /portfolio).
 *
 * Fundo sempre de CIMA para BAIXO — mesma decisão do `CoverBackground` do app:
 * um degradê diagonal ou com parada no meio lê como se saísse do centro para as
 * pontas, e a capa tem que descer contínua até fundir no fundo da página.
 *
 * Full-bleed: renderizado FORA do <main> central, direto no content do layout
 * (viewport inteira). Sobe atrás da navbar (-mt) que é transparente no topo.
 */
export function ProfileCover({
  cover,
  actions,
  children,
}: {
  cover: Cover;
  actions?: ReactNode;
  children: ReactNode;
}) {
  let bgClass = "bg-gradient-to-b from-primary/40 to-background";
  let bgStyle: CSSProperties | undefined;

  const preset = cover.type === "preset" ? findCoverPreset(cover.value) : null;

  if (cover.type === "color" && cover.value) {
    bgClass = "";
    bgStyle = {
      background: `linear-gradient(to bottom, ${cover.value}, var(--background))`,
    };
  } else if (preset) {
    bgClass = "";
    bgStyle = {
      background: `linear-gradient(to bottom, ${preset.colors.join(", ")}, var(--background))`,
    };
  } else if (cover.type === "image" && cover.value) {
    bgClass = "bg-cover bg-center";
    bgStyle = { backgroundImage: `url(${cover.value})` };
  }

  return (
    <div className="relative -mt-14 w-full md:-mt-16">
      {/* Fundo da capa: dissolve no fundo da página, sem borda. O conteúdo
          daqui mora num card de vidro com fundo próprio, então a fusão não
          compromete leitura — diferente da capa do app, onde o texto fica
          direto sobre ela. */}
      <div className={`absolute inset-0 ${bgClass}`} style={bgStyle} />
      {/* Últimos pixels até o fundo da página, para a emenda não aparecer */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />

      {/* Conteúdo (card do perfil) — pt maior para limpar a navbar fixa */}
      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-24 sm:px-6 sm:pb-20 sm:pt-28">
        {children}

        {/* Ações (compartilhar / ver como) — abaixo do card, à direita */}
        {actions && <div className="mt-5 flex justify-end">{actions}</div>}
      </div>
    </div>
  );
}
