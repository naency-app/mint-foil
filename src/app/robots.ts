import type { MetadataRoute } from "next";
import { buscarIndiceSitemap, SITE_URL } from "@/lib/servidor";

/**
 * O que o Google pode ler: o catálogo (cartas, coleções, Explorar) e as
 * páginas institucionais. Fica de fora o que é da conta de cada um (portfólio,
 * configurações, login) e os perfis públicos — quem tornou o perfil público
 * pensou em compartilhar o link, não em aparecer na busca.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const indice = await buscarIndiceSitemap();
  const paginas = indice?.paginas ?? 6;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/portfolio",
        "/settings",
        "/login",
        "/completar-perfil",
        "/showcase",
        "/loja",
      ],
    },
    sitemap: Array.from(
      { length: paginas + 1 },
      (_, i) => `${SITE_URL}/sitemap/${i}.xml`,
    ),
  };
}
