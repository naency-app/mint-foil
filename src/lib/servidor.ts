import { cache } from "react";
import type { Card, CardSet } from "@/lib/api";

/**
 * Buscas feitas no servidor, para o que o Google lê: título, descrição e
 * prévia de cada página, o conteúdo inicial da carta e o sitemap.
 *
 * Nada aqui pode derrubar a página: com o backend fora (ou o banco acordando
 * devagar), devolve `null` e a página cai no comportamento de antes, que busca
 * tudo no navegador.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

/** Endereço público do site, base das URLs canônicas e do sitemap. */
export const SITE_URL = "https://mintfoil.com";

async function buscar<T>(
  caminho: string,
  {
    revalidar,
    timeoutMs = 5000,
  }: { revalidar: number | false; timeoutMs?: number },
): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${caminho}`, {
      // false = sem cache de dados (resposta maior que os 2 MB que ele aceita)
      ...(revalidar === false
        ? { cache: "no-store" as const }
        : { next: { revalidate: revalidar } }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Uma hora: preço muda uma vez por dia; o navegador revalida por cima. */
export const buscarCarta = cache((id: string) =>
  buscar<Card>(`/cards/${encodeURIComponent(id)}`, { revalidar: 3600 }),
);

export const buscarColecao = cache((tcg: string, slug: string) =>
  buscar<CardSet>(
    `/cards/sets/${encodeURIComponent(tcg)}/${encodeURIComponent(slug)}`,
    { revalidar: 3600 },
  ),
);

export interface IndiceSitemap {
  cartas: number;
  porPagina: number;
  paginas: number;
  tcgs: string[];
  colecoes: { tcg: string; slug: string; releaseDate: string | null }[];
}

export function buscarIndiceSitemap() {
  return buscar<IndiceSitemap>("/cards/sitemap", {
    revalidar: 86400,
    timeoutMs: 20000,
  });
}

export function buscarCartasSitemap(pagina: number) {
  return buscar<{ id: string; updatedAt: string }[]>(
    `/cards/sitemap/${pagina}`,
    // ~3 MB por página: passa do limite do cache de dados; quem guarda é o
    // próprio sitemap (revalidate em app/sitemap.ts).
    { revalidar: false, timeoutMs: 30000 },
  );
}
