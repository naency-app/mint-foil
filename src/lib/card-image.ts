/**
 * Escolhe o tamanho da imagem da carta conforme onde ela aparece.
 *
 * Quem conhece o esquema de URL do CDN é a API: ela manda `images` com
 * thumb/grid/full prontos (ver `card-images.interceptor.ts` no backend). Aqui só
 * se escolhe o campo — antes esta regra vivia duplicada aqui e no app.
 *
 * O fallback para `imageUrl` cobre backend ainda não deployado e dado vindo de
 * cache antigo: nesses casos a imagem é a de sempre, nunca vazia.
 */
export type TamanhoCarta = "miniatura" | "grade" | "cheia";

interface ComImagem {
  imageUrl?: string | null;
  images?: { thumb: string; grid: string; full: string } | null;
}

export function imagemDaCarta(
  carta: ComImagem | null | undefined,
  tamanho: TamanhoCarta,
): string | undefined {
  if (!carta) return undefined;
  const i = carta.images;
  if (i) {
    if (tamanho === "cheia") return i.full;
    if (tamanho === "grade") return i.grid;
    return i.thumb;
  }
  return carta.imageUrl ?? undefined;
}
