import { IconRosetteDiscountCheckFilled } from "@tabler/icons-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { FotoDoUsuario } from "@/components/FotoDoUsuario";
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
  totalPortfolios = 0,
  totalSealed: _totalSealed,
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
  totalPortfolios?: number;
  totalSealed?: number;
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

  // Foto do perfil (círculo), metade para fora do cartão. O tamanho vem nas
  // classes (cresce no computador); `px` é o maior deles, para a foto pedida
  // ao otimizador não sair borrada.
  const avatar = (px: number, classe: string) => (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 ring-4 ring-background ${classe}`}
    >
      {image ? (
        <FotoDoUsuario
          src={image}
          alt={displayName}
          width={px}
          height={px}
          className="size-full object-cover"
        />
      ) : (
        <span className="text-5xl font-black text-primary md:text-6xl">
          {initial}
        </span>
      )}
    </div>
  );

  // Nome, @, seguidores, bio, links, valor e números — o mesmo nos dois layouts
  const info = (
    <>
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
          {displayName}
        </h1>
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
      {/* "Membro desde" sobe para junto do @: é sobre quem é a pessoa, e
          sozinho no rodapé do cartão parecia sobra */}
      <p className="text-sm font-medium text-muted-foreground">
        @{handle}
      </p>
      {memberSince && (
        <p className="text-xs font-normal text-muted-foreground/75">
          Membro desde {formatMonthYear(memberSince)}
        </p>
      )}

      {social}

      {bio && (
        <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground">
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

      {/* O que a pessoa tem, num painel só: cartas, portfólios e valor estimado
          lado a lado no computador, separados por linhas finas; no celular o
          valor fica embaixo. Números na fonte do sistema com algarismos
          alinhados, sem a monoespaçada pesada de antes (21/10). */}
      <div className="mt-6 grid w-full grid-cols-2 overflow-hidden rounded-2xl border border-border/60 bg-muted/40 md:grid-cols-[1fr_1fr_1.6fr]">
        {[
          { rotulo: "Cartas", valor: totalCards },
          { rotulo: "Portfólios", valor: totalPortfolios },
        ].map(({ rotulo, valor }, i) => (
          <div
            key={rotulo}
            className={`flex flex-col items-center justify-center px-5 py-4 ${
              i === 0
                ? "border-r border-border/60"
                : "md:border-r md:border-border/60"
            }`}
          >
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {valor}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {rotulo}
            </p>
          </div>
        ))}

        <div className="col-span-2 flex flex-col items-center justify-center border-t border-border/60 px-5 py-4 md:col-span-1 md:border-t-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {/* Soma todos os portfólios — "do portfólio" fazia parecer erro
                ao lado do gráfico, que mostra só o portfólio escolhido. */}
            Valor estimado da coleção
          </p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
            <span className="mr-1 text-lg font-bold text-primary">R$</span>
            {formatPrice(totalValue)}
          </p>
        </div>
      </div>
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
          {/* A foto sobe do app com 1200px de largura: esticada na tela
              inteira de um monitor ela estoura. No desktop a nítida fica numa
              coluna que não passa disso, e as laterais são ela desfocada,
              com a borda da coluna sumindo nelas. */}
          <Image
            src={cover.value}
            alt=""
            fill
            sizes="100vw"
            className="hidden scale-110 object-cover blur-2xl md:block"
          />
          <div className="relative mx-auto h-full w-full md:max-w-6xl md:[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <Image
              src={cover.value}
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 1152px, 100vw"
              className="object-cover"
            />
          </div>
          {/* Só o topo escurece: a navbar fixa fica legível sobre a foto */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
        </div>

        <div className="relative -mt-6 rounded-t-3xl bg-background">
          <div className="mx-auto flex w-full max-w-sm flex-col items-center px-4 pb-6 text-center md:max-w-2xl">
            {avatar(160, "-mt-[70px] mb-3 size-[140px] md:-mt-20 md:size-40")}
            {info}
          </div>

          {actions && (
            <div className="mx-auto flex max-w-370 justify-end px-4 pb-2 sm:px-6 lg:px-8">
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <ProfileCover cover={cover} actions={actions}>
      {/* Retângulo deitado no computador, com a foto metade para fora da
          borda de cima; a margem de cima abre espaço para ela não encostar
          na navbar */}
      <div className="mx-auto mt-6 w-full max-w-sm md:mt-10 md:max-w-2xl">
        <div className="glass-card flex flex-col items-center !rounded-2xl p-6 text-center md:px-10 md:pb-8">
          {avatar(
            160,
            "-mt-[88px] mb-3 size-32 md:-mt-[104px] md:mb-4 md:size-40",
          )}
          {info}
        </div>
      </div>
    </ProfileCover>
  );
}
