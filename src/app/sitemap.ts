import type { MetadataRoute } from "next";
import {
  buscarCartasSitemap,
  buscarIndiceSitemap,
  SITE_URL,
} from "@/lib/servidor";

/**
 * Sitemaps do site, em /sitemap/<id>.xml (listados no robots.txt):
 * - 0: páginas fixas, jogos e coleções;
 * - 1 em diante: as cartas, 40 mil por arquivo (o limite do Google é 50 mil).
 *
 * Dinâmico de propósito: gerado no build, um backend fora do ar deixaria o
 * sitemap vazio até a próxima revalidação. O Google lê poucas vezes por dia.
 */
export const dynamic = "force-dynamic";

/** Se o backend não responder, cobre até 240 mil cartas (arquivo vazio é válido). */
const PAGINAS_SE_FALHAR = 6;

export async function generateSitemaps() {
  const indice = await buscarIndiceSitemap();
  const paginas = indice?.paginas ?? PAGINAS_SE_FALHAR;
  return Array.from({ length: paginas + 1 }, (_, id) => ({ id }));
}

const FIXAS = [
  "/",
  "/explore",
  "/sets",
  "/raridades",
  "/download",
  "/suporte",
  "/privacidade",
  "/termos",
];

export default async function sitemap({
  id,
}: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const n = Number(await id);

  if (n === 0) {
    const indice = await buscarIndiceSitemap();
    return [
      ...FIXAS.map((p) => ({ url: `${SITE_URL}${p === "/" ? "" : p}` })),
      ...(indice?.tcgs ?? []).map((t) => ({ url: `${SITE_URL}/sets/${t}` })),
      ...(indice?.colecoes ?? []).map((c) => ({
        url: `${SITE_URL}/sets/${c.tcg}/${c.slug}`,
      })),
    ];
  }

  const cartas = await buscarCartasSitemap(n - 1);
  return (cartas ?? []).map((c) => ({
    url: `${SITE_URL}/card/${c.id}`,
    lastModified: c.updatedAt,
  }));
}
