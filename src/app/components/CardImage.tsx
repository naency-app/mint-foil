"use client";

import { IconPhotoOff } from "@tabler/icons-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { imagemDaCarta, type TamanhoCarta } from "@/lib/card-image";
import { cn } from "@/lib/utils";

/**
 * Imagem de carta com cascata de fallback.
 *
 * O CDN do TCGplayer responde 403 para parte dos produtos (playtest cards,
 * pré-releases, promos antigas) — em TODOS os tamanhos, não só nos derivados.
 * Sem tratamento o navegador desenha o ícone de imagem quebrada com o nome do
 * arquivo ao lado, que é pior do que assumir que a arte não existe.
 *
 * A ordem é: tamanho pedido → `imageUrl` original (caso só o derivado falte) →
 * placeholder. O passo do meio existe porque `grid`/`full` são construídos a
 * partir da URL do banco; se um dia um produto tiver só a miniatura, ele ainda
 * aparece.
 */
interface CartaComImagem {
  imageUrl?: string | null;
  images?: { thumb: string; grid: string; full: string } | null;
}

interface CardImageProps {
  carta: CartaComImagem;
  tamanho: TamanhoCarta;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  /** Texto "sem imagem" no placeholder. Desligue em miniaturas (~48px). */
  rotulo?: boolean;
}

export function CardImage({
  carta,
  tamanho,
  alt,
  className,
  width,
  height,
  fill,
  sizes,
  priority,
  rotulo = true,
}: CardImageProps) {
  const preferida = imagemDaCarta(carta, tamanho);
  const original = carta.imageUrl ?? undefined;
  const [passo, setPasso] = useState(0);

  // A mesma instância é reaproveitada quando a lista troca de carta (scroll
  // infinito, filtro): sem isto, uma carta sem arte "contaminaria" a próxima.
  useEffect(() => {
    setPasso(0);
  }, [preferida, original]);

  const src =
    passo === 0 ? (preferida ?? original) : passo === 1 ? original : undefined;

  if (!src) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 bg-muted/40 text-muted-foreground",
          // Sem imagem o <img> desaparece e o container encolhe para a altura
          // do texto — a página inteira se reorganiza em volta de uma tira.
          // A proporção de carta segura o buraco no tamanho que a arte teria.
          fill ? "absolute inset-0" : "aspect-[5/7]",
          className,
        )}
        title={`${alt} — sem imagem disponível`}
      >
        <IconPhotoOff className="size-5 shrink-0 opacity-60" />
        {rotulo && (
          <span className="px-2 text-center text-[9px] font-semibold uppercase tracking-wider opacity-70">
            sem imagem
          </span>
        )}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      {...(fill ? { fill: true } : { width, height })}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() =>
        setPasso((p) => (p === 0 && original && original !== preferida ? 1 : 2))
      }
    />
  );
}
