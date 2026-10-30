import type { MetadataRoute } from "next";
import { buscarIndiceSitemap, SITE_URL } from "@/lib/servidor";

const BOTS_DE_SEO = [
  "AhrefsBot",
  "AhrefsSiteAudit",
  "SemrushBot",
  "SiteAuditBot",
  "AwarioBot",
  "AwarioSmartBot",
  "AwarioRssBot",
  "MJ12bot",
  "DotBot",
  "BLEXBot",
  "DataForSeoBot",
  "PetalBot",
  "Barkrowler",
  "serpstatbot",
];

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
    rules: [
      {
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
      // Robôs de SEO e de monitoramento: percorrem o sitemap inteiro e cada
      // carta renderiza no servidor. Em 30/10 eram mais da metade dos pedidos
      // (Ahrefs sozinho 14 mil em 24 h) e estouraram a cota de funções da
      // Vercel, sem trazer visita nenhuma. Google e Bing seguem liberados.
      {
        userAgent: BOTS_DE_SEO,
        disallow: "/",
      },
    ],
    sitemap: Array.from(
      { length: paginas + 1 },
      (_, i) => `${SITE_URL}/sitemap/${i}.xml`,
    ),
  };
}
