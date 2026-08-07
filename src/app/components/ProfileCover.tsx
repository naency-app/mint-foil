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
/**
 * Fundo da capa a partir das cores do catálogo, esmaecidas até sumir.
 *
 * Aqui o fundo é decorativo — o conteúdo mora num card com fundo próprio —,
 * então a cor entra como véu sobre a página, não em força total: cor saturada
 * cheia terminando no branco do tema claro vira uma faixa lavada, e no escuro
 * fica pesada demais. Com transparência, o mesmo preset se resolve nos dois
 * temas, porque quem aparece por baixo é o fundo da página.
 *
 * No app é o oposto: lá o texto fica direto sobre a capa e ela precisa da cor
 * cheia para o contraste funcionar.
 */
function veu(cores: string[]): string {
  const inicio = 60;
  const passo = cores.length > 1 ? inicio / cores.length : inicio / 2;
  const paradas = cores.map(
    (c, i) =>
      `color-mix(in oklab, ${c} ${Math.round(inicio - i * passo)}%, transparent)`,
  );
  return `linear-gradient(to bottom, ${paradas.join(", ")}, transparent)`;
}

export function ProfileCover({
  cover,
  actions,
  children,
}: {
  cover: Cover;
  actions?: ReactNode;
  children: ReactNode;
}) {
  // Gradiente da marca — o padrão de quem não escolheu fundo. Diagonal e com o
  // tertiary no fim, exatamente como sempre foi: a mudança para vertical veio
  // de uma decisão sobre a capa do app e não tinha por que valer aqui.
  let bgClass =
    "bg-gradient-to-br from-primary/30 via-primary/10 to-tertiary/25";
  let bgStyle: CSSProperties | undefined;

  const preset = cover.type === "preset" ? findCoverPreset(cover.value) : null;

  if (cover.type === "color" && cover.value) {
    bgClass = "";
    bgStyle = { background: veu([cover.value]) };
  } else if (preset) {
    bgClass = "";
    bgStyle = { background: veu(preset.colors) };
  } else if (cover.type === "image" && cover.value) {
    bgClass = "bg-cover bg-center";
    bgStyle = { backgroundImage: `url(${cover.value})` };
  }

  return (
    <div className="relative -mt-14 w-full md:-mt-16">
      {/* Fundo da capa. Termina em transparente e o fundo da página aparece
          por baixo — sem faixa de fusão extra, que era justamente quem deixava
          a emenda clara visível no tema claro. */}
      <div className={`absolute inset-0 ${bgClass}`} style={bgStyle} />

      {/* Conteúdo (card do perfil) — pt maior para limpar a navbar fixa */}
      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-24 sm:px-6 sm:pb-20 sm:pt-28">
        {children}

        {/* Ações (compartilhar / ver como) — abaixo do card, à direita */}
        {actions && <div className="mt-5 flex justify-end">{actions}</div>}
      </div>
    </div>
  );
}
