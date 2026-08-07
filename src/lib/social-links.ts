/**
 * Redes e marketplaces do perfil público — espelho de `lib/social-links.ts` do
 * app. A chave é a que vai no jsonb `socials` do usuário; manter em par com a
 * do app (uma rede só de lá simplesmente não é exibida aqui).
 *
 * O ícone é o favicon do site, servido pelo Google — ícone de linha pintado com
 * uma cor de marca escolhida a dedo não é a identidade de ninguém.
 */
export interface SocialLink {
  key: string;
  label: string;
  /** Base da URL quando o valor guardado é só o usuário/@. */
  prefix?: string;
  /** O identificador é um @ (rede social) ou um nome de loja (marketplace). */
  arroba?: boolean;
  /** Domínio do favicon. Vazio = tira da URL salva (caso do site próprio). */
  domain: string;
  /** Exemplo mostrado no formulário de edição. */
  placeholder?: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    key: "instagram",
    label: "Instagram",
    prefix: "https://instagram.com/",
    arroba: true,
    domain: "instagram.com",
    placeholder: "@seuperfil",
  },
  {
    key: "x",
    label: "X",
    prefix: "https://x.com/",
    arroba: true,
    domain: "x.com",
    placeholder: "@seuperfil",
  },
  {
    key: "tiktok",
    label: "TikTok",
    prefix: "https://tiktok.com/@",
    arroba: true,
    domain: "tiktok.com",
    placeholder: "@seuperfil",
  },
  {
    key: "youtube",
    label: "YouTube",
    domain: "youtube.com",
    placeholder: "https://youtube.com/@canal",
  },
  {
    key: "twitch",
    label: "Twitch",
    prefix: "https://twitch.tv/",
    arroba: true,
    domain: "twitch.tv",
    placeholder: "@seucanal",
  },
  {
    key: "site",
    label: "Site",
    domain: "",
    placeholder: "https://seusite.com.br",
  },
  // Marketplaces do mercado brasileiro (eBay/TCGplayer ficaram de fora).
  {
    key: "myp",
    label: "MyP",
    prefix: "https://mypcards.com/",
    domain: "mypcards.com",
    placeholder: "sualoja",
  },
  {
    key: "liga",
    label: "Liga",
    domain: "ligamagic.com.br",
    placeholder: "https://www.ligamagic.com.br/…",
  },
];

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

/** URL do favicon a exibir. */
export function faviconFor(link: SocialLink, url: string): string {
  const domain = link.domain || hostnameOf(url);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

/**
 * Texto digitado → URL para gravar. Aceita URL completa, `@usuario` ou
 * `usuario`; devolve `null` para campo vazio (que o backend trata como remoção)
 * e `undefined` quando não dá para montar URL nenhuma.
 */
export function toUrl(
  link: SocialLink,
  raw: string,
): string | null | undefined {
  const v = raw.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (!link.prefix) return undefined; // campo sem prefixo exige URL completa
  return link.prefix + v.replace(/^@+/, "");
}

/** URL gravada → texto curto para exibir. */
export function toDisplay(link: SocialLink, url: string): string {
  if (link.prefix && url.startsWith(link.prefix)) {
    const rest = url.slice(link.prefix.length).replace(/\/$/, "");
    return link.arroba ? `@${rest}` : rest;
  }
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}
