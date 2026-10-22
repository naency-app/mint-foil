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

  // Foto do perfil (círculo). O tamanho vem em classes para poder mudar por
  // tela sem renderizar duas fotos: 96px no cartão do celular, 144px no do
  // computador, 140px na capa estilo Facebook.
  const avatar = (classe: string) => (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 ring-4 ring-background ${classe}`}
    >
      {image ? (
        <FotoDoUsuario
          src={image}
          alt={displayName}
          width={144}
          height={144}
          className="size-full object-cover"
        />
      ) : (
        <span className="font-black text-primary">{initial}</span>
      )}
    </div>
  );

  // Quem é a pessoa: nome, @, seguidores, bio e links
  const identidade = (
    <>
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground md:group-data-[lado]/perfil:text-2xl">
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
      <p className="text-sm font-medium text-muted-foreground">@{handle}</p>

      {social}

      {bio && (
        <p className="mt-3 text-sm leading-relaxed text-foreground">{bio}</p>
      )}

      {links.length > 0 && (
        /* Quebra em linhas em vez de rolar: o card tem largura fixa, e
                 rolagem horizontal aqui não tem affordance nenhuma — o terceiro
                 link simplesmente sumia cortado na borda. */
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 md:group-data-[lado]/perfil:justify-start">
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
    </>
  );

  // O que ela tem: valor, cartas e selados
  const numeros = (
    <>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {/* Soma todos os portfólios — "do portfólio" fazia parecer erro
              ao lado do gráfico, que mostra só o portfólio escolhido. */}
        Valor estimado da coleção
      </p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
        <span className="mr-1 text-lg font-bold text-muted-foreground">R$</span>
        {formatPrice(totalValue)}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          { rotulo: "Cartas", valor: totalCards },
          { rotulo: "Selados", valor: totalSealed },
        ].map(({ rotulo, valor }) => (
          <div key={rotulo} className="rounded-xl bg-muted/60 px-3 py-2.5">
            <p className="text-lg font-bold text-foreground tabular-nums">
              {valor}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {rotulo}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground/70">
        Membro desde {formatMonthYear(memberSince)}
      </p>
    </>
  );

  // Uma coluna (celular e capa com foto): números abaixo de uma linha fina que
  // separa quem é a pessoa do que ela tem; números na fonte do sistema com
  // algarismos alinhados, sem a monoespaçada pesada de antes (21/10)
  const info = (
    <>
      {identidade}
      <div className="mt-5 w-full border-t border-border pt-5">{numeros}</div>
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

        {actions && (
          <div className="absolute top-20 right-4 z-10 sm:top-24 sm:right-6">
            {actions}
          </div>
        )}

        <div className="relative -mt-6 rounded-t-3xl bg-background">
          <div className="mx-auto flex w-full max-w-sm flex-col items-center px-4 pb-10 text-center">
            {avatar("-mt-[70px] mb-3 size-[140px] text-[56px]")}
            {info}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProfileCover cover={cover} actions={actions}>
      {/* No celular, coluna única com a foto saindo do topo. No computador o
          cartão deita: foto grande à esquerda, quem é a pessoa no meio e os
          números à direita, separados por uma linha vertical. */}
      <div className="mx-auto w-full max-w-sm md:max-w-3xl">
        <div className="glass-card flex flex-col items-center !rounded-2xl p-6 text-center md:flex-row md:gap-8 md:p-8">
          {avatar(
            "-mt-16 mb-3 size-24 text-[38px] md:m-0 md:size-36 md:text-[58px]",
          )}
          <div
            data-lado
            className="group/perfil flex min-w-0 flex-1 flex-col items-center md:items-start md:text-left"
          >
            {identidade}
          </div>
          <div className="mt-5 w-full border-t border-border pt-5 md:mt-0 md:w-60 md:shrink-0 md:self-stretch md:border-t-0 md:border-l md:pt-0 md:pl-8 md:flex md:flex-col md:justify-center">
            {numeros}
          </div>
        </div>
      </div>
    </ProfileCover>
  );
}
