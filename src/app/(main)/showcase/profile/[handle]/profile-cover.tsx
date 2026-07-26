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
  children,
}: {
  cover: Cover;
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
    <div className="relative w-full">
      {/* Fundo da capa */}
      <div className={`absolute inset-0 ${bgClass}`} style={bgStyle} />
      {/* Degradê para o fundo da página (blende a base da capa) */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />

      {/* Conteúdo (card do perfil), re-centralizado no container padrão */}
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        {children}
      </div>
    </div>
  );
}
