import { IconRosetteDiscountCheckFilled } from "@tabler/icons-react";
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
  social,
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
  /** Seguidores/seguindo e o botão de seguir, logo abaixo do @. */
  social?: ReactNode;
  actions?: ReactNode;
}) {
  const initial = displayName.charAt(0).toUpperCase();
  // Ordem do catálogo, não a do objeto vindo da API: duas visitas ao mesmo
  // perfil têm que mostrar os links na mesma ordem.
  const links = SOCIAL_LINKS.flatMap((link) => {
    const url = socials?.[link.key];
    return url ? [{ link, url }] : [];
  });

  // Foto do perfil (círculo): 96px no cartão, 140px na capa estilo Facebook
  const avatar = (px: number, classe: string) => (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 ring-4 ring-background ${classe}`}
      style={{ width: px, height: px }}
    >
      {image ? (
        <Image
          src={image}
          alt={displayName}
          width={px}
          height={px}
          className="size-full object-cover"
        />
      ) : (
        <span
          className="font-black text-primary"
          style={{ fontSize: px * 0.4 }}
        >
          {initial}
        </span>
      )}
    </div>
  );

  // Nome, @, seguidores, bio, links, valor e números — o mesmo nos dois layouts
  const info = (
    <>
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-black text-foreground">{displayName}</h1>
        {/*
                Selo de assinante. Diz Pro, não "identidade verificada" — decisão
                de produto tomada de olhos abertos, porque o símbolo é lido como
                verificação em qualquer lugar. Se um dia existir verificação de
                verdade, ela precisa de outro símbolo.
                O azul não sai da paleta por acaso: um check rosa não seria
                entendido. Mesmo tom do app (PRO_BADGE_BLUE).
              */}
        {isPro && (
          <IconRosetteDiscountCheckFilled
            className="size-5 shrink-0"
            style={{ color: "#1D9BF0" }}
            aria-label="Assinante Pro"
          />
        )}
      </div>
      <p className="text-sm font-medium text-muted-foreground">@{handle}</p>

      {social}

      {bio && (
        <p className="mt-3 text-sm leading-relaxed text-foreground">{bio}</p>
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
        {/* Soma todos os portfólios — "do portfólio" fazia parecer erro
                  ao lado do gráfico, que mostra só o portfólio escolhido. */}
        Valor estimado da coleção
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
    </>
  );

  /*
   * Com foto própria no fundo, capa estilo Facebook — a mesma do perfil social
   * do app: a foto nítida em cima, uma folha com cantos arredondados sobe por
   * cima dela, o avatar maior fica metade na capa, e o texto vai para a folha,
   * longe da foto. Com gradiente, cor ou preset, segue o cartão de vidro.
   */
  if (cover.type === "image" && cover.value) {
    return (
      <div className="relative -mt-14 w-full md:-mt-16">
        <div className="relative h-56 w-full overflow-hidden sm:h-72">
          <Image
            src={cover.value}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Só o topo escurece: a navbar fixa fica legível sobre a foto */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
        </div>

        {actions && (
          <div className="absolute top-20 right-4 z-10 sm:top-24 sm:right-6">
            {actions}
          </div>
        )}

        <div className="relative -mt-6 rounded-t-3xl bg-background">
          <div className="mx-auto flex w-full max-w-sm flex-col items-center px-4 pb-10 text-center">
            {avatar(140, "-mt-[70px] mb-3")}
            {info}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProfileCover cover={cover} actions={actions}>
      <div className="mx-auto w-full max-w-sm">
        <div className="glass-card flex flex-col items-center !rounded-2xl p-6 text-center">
          {avatar(96, "-mt-16 mb-3")}
          {info}
        </div>
      </div>
    </ProfileCover>
  );
}
