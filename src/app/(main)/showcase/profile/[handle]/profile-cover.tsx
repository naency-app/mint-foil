import type { CSSProperties, ReactNode } from "react";
import type { Cover } from "./types";

/**
 * Capa full-bleed do perfil (showcase). Renderiza o fundo conforme a escolha do
 * usuário e faz degradê para o fundo da página embaixo. Futuro: o editor de
 * perfil grava cover.type/value (cor, imagem ou gif) — este componente já cobre
 * os três casos, então nada muda aqui quando o editor existir.
 *
 * Full-bleed: é renderizado FORA do <main> central, direto no content do layout
 * (que ocupa a viewport toda), então w-full já cobre a largura inteira.
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
  // Estilo do fundo por tipo. gradient = padrão da marca (via classes Tailwind).
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
    // -mt-14/-mt-16 cancela o pt do layout → a capa sobe para TRÁS da navbar,
    // que é translúcida (blur) e deixa a cor da capa aparecer por baixo.
    <div className="relative -mt-14 w-full md:-mt-16">
      {/* Fundo da capa */}
      <div className={`absolute inset-0 ${bgClass}`} style={bgStyle} />
      {/* Degradê para o fundo da página (blende a base da capa) */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />

      {/* Conteúdo (card do perfil) — pt maior para limpar a navbar fixa */}
      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-24 sm:px-6 sm:pb-20 sm:pt-28">
        {children}

        {/* Ações do dono (compartilhar) — abaixo do card, alinhadas à direita */}
        {actions && <div className="mt-5 flex justify-end">{actions}</div>}
      </div>
    </div>
  );
}
