import { Crown } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { faviconFor, SOCIAL_LINKS, toDisplay } from "@/lib/social-links";
import { type Cover, ProfileCover } from "./ProfileCover";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatMonthYear(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Cabeçalho de perfil compartilhado por /showcase (público) e /portfolio (dono):
 * capa full-bleed + card centralizado (avatar, nome, @handle, valor estimado,
 * Cartas/Selados, membro desde). `actions` é o slot para os botões contextuais
 * (Compartilhar no público; Ver como/gestão no dono).
 */
export function ProfileHeader({
  displayName,
  handle,
  image,
  isPro,
  memberSince,
  totalCards,
  totalSealed,
  totalValue,
  cover,
  bio,
  socials,
  actions,
}: {
  displayName: string;
  handle: string;
  image: string | null;
  isPro: boolean;
  memberSince: string | null;
  totalCards: number;
  totalSealed: number;
  totalValue: number;
  cover: Cover;
  bio?: string | null;
  socials?: Record<string, string>;
  actions?: ReactNode;
}) {
  const initial = displayName.charAt(0).toUpperCase();
  // Ordem do catálogo, não a do objeto vindo da API: duas visitas ao mesmo
  // perfil têm que mostrar os links na mesma ordem.
  const links = SOCIAL_LINKS.flatMap((link) => {
    const url = socials?.[link.key];
    return url ? [{ link, url }] : [];
  });

  return (
    <ProfileCover cover={cover} actions={actions}>
      <div className="mx-auto w-full max-w-sm">
        <div className="glass-card flex flex-col items-center !rounded-2xl p-6 text-center">
          <div className="-mt-16 mb-3 flex size-24 items-center justify-center overflow-hidden rounded-full bg-primary/15 ring-4 ring-background">
            {image ? (
              <Image
                src={image}
                alt={displayName}
                width={96}
                height={96}
                className="size-24 object-cover"
              />
            ) : (
              <span className="text-4xl font-black text-primary">
                {initial}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-foreground">
              {displayName}
            </h1>
            {isPro && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
                <Crown className="size-3" />
                PRO
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-muted-foreground">@{handle}</p>

          {bio && (
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {bio}
            </p>
          )}

          {links.length > 0 && (
            /* Quebra em linhas em vez de rolar: o card tem largura fixa, e
               rolagem horizontal aqui não tem affordance nenhuma — o terceiro
               link simplesmente sumia cortado na borda. */
            <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2">
              {links.map(({ link, url }) => (
                <a
                  key={link.key}
                  href={url}
                  target="_blank"
                  // Link de terceiro em página pública: sem isto, a aba aberta
                  // ganha acesso a window.opener e o referrer vaza o perfil.
                  rel="noopener noreferrer nofollow ugc"
                  className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-foreground transition hover:opacity-70"
                >
                  {/* <img> e não next/image: favicon de 20px não ganha nada com
                      o otimizador, e evita liberar o host no next.config. */}
                  {/* biome-ignore lint/performance/noImgElement: favicon 20px */}
                  <img
                    src={faviconFor(link, url)}
                    alt=""
                    width={20}
                    height={20}
                    className="size-3.5 shrink-0 rounded-[3px]"
                    loading="lazy"
                  />
                  <span className="max-w-[180px] truncate">
                    {toDisplay(link, url)}
                  </span>
                </a>
              ))}
            </div>
          )}

          <p className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground">
            Valor estimado do portfólio
          </p>
          <p className="font-mono text-3xl font-black text-foreground">
            R$ {formatPrice(totalValue)}
          </p>

          <div className="mt-4 flex items-stretch divide-x divide-border">
            <div className="px-6">
              <p className="font-mono text-lg font-black text-foreground">
                {totalCards}
              </p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Cartas
              </p>
            </div>
            <div className="px-6">
              <p className="font-mono text-lg font-black text-foreground">
                {totalSealed}
              </p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Selados
              </p>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-muted-foreground/70">
            Membro desde {formatMonthYear(memberSince)}
          </p>
        </div>
      </div>
    </ProfileCover>
  );
}
