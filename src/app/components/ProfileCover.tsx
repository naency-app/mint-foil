import type { CSSProperties, ReactNode } from "react";

export type CoverType = "gradient" | "color" | "image";

export interface Cover {
  type: CoverType;
  value: string | null;
}

/**
 * Capa full-bleed do perfil (compartilhada por /showcase e /portfolio).
 * Renderiza o fundo conforme a escolha do usuário e faz degradê para o fundo
 * da página. Futuro: o editor de perfil grava cover.type/value (cor, imagem ou
 * gif) — este componente já cobre os três casos, então nada muda aqui.
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
  let bgClass = "bg-gradient-to-br from-primary/30 via-primary/10 to-tertiary/25";
  let bgStyle: CSSProperties | undefined;

  if (cover.type === "color" && cover.value) {
    bgClass = "";
    bgStyle = { background: cover.value };
  } else if (cover.type === "image" && cover.value) {
    bgClass = "bg-cover bg-center";
    bgStyle = { backgroundImage: `url(${cover.value})` };
  }

  return (
    <div className="relative -mt-14 w-full md:-mt-16">
      {/* Fundo da capa */}
      <div className={`absolute inset-0 ${bgClass}`} style={bgStyle} />
      {/* Degradê para o fundo da página */}
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
