"use client";

import {
  IconAlertCircle,
  IconChevronLeft,
  IconExternalLink,
  IconPackage,
  IconShoppingCart,
  IconTrendingDown,
  IconTrendingUp,
  IconWorld,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { CardImage } from "@/app/components/CardImage";
import { ConviteAppCartao } from "@/app/components/ConviteApp";
import { PortfolioSelector } from "@/app/components/PortfolioSelector";
import { useQuickAdd } from "@/app/components/QuickAdd";
import { RollingCounter } from "@/app/components/RollingCounter";
import { TagTutorialRaridade } from "@/app/components/TagTutorialRaridade";
import { Area } from "@/components/charts/area";
import { AreaChart } from "@/components/charts/area-chart";
import Grid from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { EstadoVazio } from "@/components/EstadoVazio";
import { Trilha } from "@/components/Trilha";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuantidadeNoPortfolio } from "@/hooks/use-quantidade-no-portfolio";
import { ApiError, type Card, type CollectionItem } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import {
  resolveActiveId,
  sortByFavorite,
  usePortfolioStore,
} from "@/lib/portfolio-store";
import {
  useCardDetail,
  useCardOwnership,
  useInvalidateCollection,
  usePortfolios,
} from "@/lib/queries";
import { nomeDaRaridade } from "@/lib/raridade";
import { precoAnterior, precoAtual } from "@/lib/reference-price";
import { cardName, cardNameEn, cn } from "@/lib/utils";

// O texto vem da base do jogo com HTML: "<br>" para quebra, "<strong>" nos
// títulos ("Pendulum Effect"), "<em>" e às vezes "<div>"/"<span>" de enfeite.
// Antes só o <br> era tratado e o resto aparecia cru ("<strong>Pendulum
// Effect</strong>", 23/10). Negrito e itálico viram elementos de verdade, o
// resto das tags sai, e sem dangerouslySetInnerHTML: o texto é de terceiro.
function TextoDaCarta({ html }: { html: string }) {
  const texto = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(?!strong\b|em\b)[a-z][^>]*>/gi, "")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    // "<br>\n<br><br>\n<br>" virava um buraco de quatro linhas
    .replace(/\n{3,}/g, "\n\n")
    // Título colado no texto dele, com o espaço só entre os blocos
    .replace(/<\/strong>\n+/gi, "</strong>\n")
    .trim();

  return texto
    .split(/(<strong>[\s\S]*?<\/strong>|<em>[\s\S]*?<\/em>)/gi)
    .map((parte, i) => {
      const dentro = parte.replace(/<[^>]+>/g, "");
      if (/^<strong>/i.test(parte)) {
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: pedaços fixos do texto
          <strong key={i} className="font-semibold text-foreground">
            {dentro}
          </strong>
        );
      }
      if (/^<em>/i.test(parte)) {
        // biome-ignore lint/suspicious/noArrayIndexKey: pedaços fixos do texto
        return <em key={i}>{dentro}</em>;
      }
      return dentro;
    });
}

// Código utilizável na busca da Liga: precisa ser prefixado por set
// ("JUSH-EN022", "OP12-108"). Fração/número solto (Pokémon "094/162", Magic
// "135", Lorcana "41/204") não identifica a carta — nesses o nome é melhor.
// Digimon traz a raridade colada ("BT10-030 C"); o sufixo sai.
// Espelha ligaSearchCode do backend (price-sources.const.ts).
function ligaSearchCode(collectorNumber?: string | null): string | null {
  const raw = collectorNumber?.trim();
  if (!raw) return null;
  const code = raw.split(/\s+/)[0];
  return /^[A-Za-z0-9]+-[A-Za-z0-9]+$/.test(code) ? code.toUpperCase() : null;
}

function ligaUrl(
  baseUrl: string,
  cardName: string,
  code: string | null,
): string {
  if (code)
    return `${baseUrl}/?view=cards%2Fsearch&card=${encodeURIComponent(code)}&tipo=1`;
  return `${baseUrl}/?view=cards/card&card=${encodeURIComponent(cardName)}`;
}

function getSearchUrls(
  cardName: string,
  tcgSlug?: string,
  collectorNumber?: string | null,
) {
  const ligaCode = ligaSearchCode(collectorNumber);
  const urls: {
    name: string;
    url: string;
    color: string;
    label: string;
    logo?: string;
  }[] = [];

  // Favicons dos sites (fundo de marca embutido) — legíveis nos dois temas,
  // diferente dos wordmarks transparentes que sumiam no light.
  if (!tcgSlug || tcgSlug === "magic") {
    urls.push({
      name: "LigaMagic",
      url: ligaUrl("https://www.ligamagic.com.br", cardName, ligaCode),
      color: "text-blue-400",
      label: "Buscar no LigaMagic",
      logo: "/logos/sites/favicons/ligamagic.png",
    });
  }
  if (!tcgSlug || tcgSlug === "pokemon") {
    urls.push({
      name: "LigaPokemon",
      url: ligaUrl("https://www.ligapokemon.com.br", cardName, ligaCode),
      color: "text-yellow-400",
      label: "Buscar no LigaPokemon",
      logo: "/logos/sites/favicons/ligapokemon.png",
    });
  }
  if (!tcgSlug || tcgSlug === "yugioh") {
    urls.push({
      name: "LigaYugioh",
      url: ligaUrl("https://www.ligayugioh.com.br", cardName, ligaCode),
      color: "text-purple-400",
      label: "Buscar no LigaYugioh",
      logo: "/logos/sites/favicons/ligayugioh.png",
    });
  }
  if (!tcgSlug || tcgSlug === "onepiece") {
    urls.push({
      name: "LigaOnePiece",
      url: ligaUrl("https://www.ligaonepiece.com.br", cardName, ligaCode),
      color: "text-red-400",
      label: "Buscar no LigaOnePiece",
      logo: "/logos/sites/favicons/ligaonepiece.png",
    });
  }
  if (!tcgSlug || tcgSlug === "lorcana") {
    urls.push({
      name: "LigaLorcana",
      url: ligaUrl("https://www.ligalorcana.com.br", cardName, ligaCode),
      color: "text-amber-400",
      label: "Buscar no LigaLorcana",
      logo: "/logos/sites/favicons/ligalorcana.png",
    });
  }
  if (!tcgSlug || tcgSlug === "digimon") {
    urls.push({
      name: "LigaDigimon",
      url: ligaUrl("https://www.ligadigimon.com.br", cardName, ligaCode),
      color: "text-sky-400",
      label: "Buscar no LigaDigimon",
      logo: "/logos/sites/favicons/ligadigimon.png",
    });
  }
  // A LigaDragonBall cobre os dois jogos de Dragon Ball (24/10)
  if (!tcgSlug || tcgSlug === "dragonball" || tcgSlug === "fusionworld") {
    urls.push({
      name: "LigaDragonBall",
      url: ligaUrl("https://www.ligadragonball.com.br", cardName, ligaCode),
      color: "text-orange-400",
      label: "Buscar no LigaDragonBall",
      logo: "/logos/sites/favicons/ligadragonball.png",
    });
  }
  // MyPCards: a página de produto usa um ID interno (ex.: /yugioh/produto/311239/…)
  // que não temos como derivar — o link de conferência vai pra busca, com a
  // mesma regra da Liga: código só quando ele identifica a carta sozinho
  // ("OP12-108"); senão, o nome completo. Buscar só a fração ("173/193") caía
  // em OUTRA versão quando a loja não tinha a da pessoa — agora ela mostra
  // que não tem.
  // Na MyPCards os dois Dragon Ball têm endereço próprio
  const MYP_SLUG: Record<string, string> = {
    dragonball: "dbsmasters",
    fusionworld: "dbsfusion",
  };
  const myPTcg = (tcgSlug && MYP_SLUG[tcgSlug]) ?? tcgSlug ?? "yugioh";
  const myPUrl = `https://mypcards.com/${myPTcg}?${new URLSearchParams({
    "ProdutoSearch[marca]": myPTcg,
    "ProdutoSearch[query]": ligaCode ?? cardName,
  }).toString()}`;
  urls.push({
    name: "MyPCards",
    url: myPUrl,
    color: "text-orange-400",
    label: "Ver no MyPCards",
    logo: "/logos/sites/favicons/mypcards.png",
  });

  return urls;
}

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Skeleton 1:1 com o layout final — mesmos wrappers, paddings e proporções
 * (aspect-5/7 da imagem, aspect-2.2/1 do chart, alturas das linhas), então a
 * troca skeleton → conteúdo não desloca nada na tela.
 */
function CardDetailSkeleton() {
  return (
    <main className="max-w-370 mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-64" />

      {/* Header: título + caixa de preço (mesmas alturas do conteúdo real) */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-96 max-w-full" />
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="space-y-1.5 md:items-end md:flex md:flex-col">
          <Skeleton className="h-3 w-44" />
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Imagem (aspect ~5/7 aproxima a carta real; frame igual ao final) */}
        <div className="lg:col-span-3">
          <Skeleton className="w-full aspect-5/7 rounded-2xl" />
        </div>

        {/* Chart + detalhes */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-card !rounded-2xl p-5 space-y-4">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="w-full aspect-[2.2/1] rounded-lg" />
          </div>
          <div className="glass-card !rounded-2xl p-5 space-y-4">
            <Skeleton className="h-6 w-28" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: lista estática de placeholders
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Adicionar + lojas */}
        <div className="lg:col-span-4 space-y-5">
          <div className="glass-card !rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-9 w-44 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-8 w-32 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="glass-card !rounded-2xl p-5 space-y-3">
            <Skeleton className="h-6 w-48" />
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: lista estática de placeholders
              <div key={i} className="flex items-center gap-3 py-1">
                <Skeleton className="size-7 rounded-md" />
                <Skeleton className="h-3.5 w-40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Parte interativa da tela da carta. `inicial` vem do servidor (page.tsx): com
 * ele a página já sai do servidor com nome, foto e preço — é o que o Google lê.
 */
export function CardDetailClient({
  id,
  inicial,
}: {
  id: string;
  inicial: Card | null;
}) {
  const cardQuery = useCardDetail(id, inicial ?? undefined);
  const card = cardQuery.data ?? null;
  const loading = cardQuery.isPending;
  const error = cardQuery.error ? cardQuery.error.message : null;
  // Só o 404 é "não existe": sem rede ou com o servidor fora a carta existe,
  // e o título dizendo o contrário mandava a pessoa desistir do link
  const naoExiste =
    !cardQuery.error ||
    (cardQuery.error instanceof ApiError && cardQuery.error.status === 404);
  const { data: session } = useSession();
  const { pedirLogin } = useQuickAdd();
  const router = useRouter();
  const searchParams = useSearchParams();
  const portfolioId = searchParams.get("portfolioId");
  const fromPortfolio =
    searchParams.get("from") === "portfolio" || !!portfolioId;
  // Lista compartilhada com Explore/Portfólio pela chave ['portfolios'] — antes
  // esta página buscava a mesma lista DUAS vezes (aqui e dentro do fetch de
  // itens), a cada montagem e a cada mudança de quantidade.
  const { data: portfoliosData } = usePortfolios(!!session?.user);
  // Contexto compartilhado: a escolha feita aqui vale nas outras telas e
  // sobrevive à navegação (ver lib/portfolio-store)
  const storeActiveId = usePortfolioStore((s) => s.activeId);
  const favoriteIds = usePortfolioStore((s) => s.favoriteIds);
  const setActive = usePortfolioStore((s) => s.setActive);
  const activePortfolioId = storeActiveId ?? "";
  const setActivePortfolioId = setActive;
  const portfolios = useMemo(
    () => sortByFavorite(portfoliosData ?? [], favoriteIds),
    [portfoliosData, favoriteIds],
  );

  // Onde esta carta está, em qualquer portfólio: UMA requisição. Antes eram N —
  // o portfólio inteiro de cada um dos portfólios do usuário, baixado só para
  // filtrar um item no cliente, e refeito a cada mudança de quantidade.
  const { data: ownershipData } = useCardOwnership(id, !!session?.user);
  const ownedItems = useMemo(
    () => (ownershipData ?? []) as unknown as CollectionItem[],
    [ownershipData],
  );

  // Qual portfólio fica ativo quando a lista chega (favorito > salvo > primeiro).
  useEffect(() => {
    if (portfolios.length === 0) return;
    const alvo = resolveActiveId(portfolios, storeActiveId, favoriteIds);
    if (alvo && alvo !== storeActiveId) setActivePortfolioId(alvo);
  }, [portfolios, storeActiveId, favoriteIds, setActivePortfolioId]);

  const invalidateCollection = useInvalidateCollection();
  const handleRefresh = invalidateCollection;

  // Quantidade que o usuário já tem no portfólio ativo (condição NM) + o item
  // correspondente (pra update/remove).
  const ownedQtyActive = useMemo(
    () =>
      ownedItems
        .filter((item) => item.portfolioId === activePortfolioId)
        .reduce((acc, item) => acc + item.quantity, 0),
    [ownedItems, activePortfolioId],
  );
  const activeNmItem = useMemo(
    () =>
      ownedItems.find(
        (item) =>
          item.portfolioId === activePortfolioId && item.condition === "NM",
      ) ?? null,
    [ownedItems, activePortfolioId],
  );

  // Contador controla direto a quantidade no portfólio ativo: otimista, um
  // único request ~320ms depois do último passo, check animado ao somar. A
  // mesma lógica dos cards do Explorar (hooks/use-quantidade-no-portfolio).
  const qtd = useQuantidadeNoPortfolio({
    cardId: id,
    portfolioId: activePortfolioId || undefined,
    quantidadeServidor: ownedQtyActive,
    itemNm: activeNmItem,
    logado: !!session?.user,
    pedirLogin: () => {
      if (!card) return;
      pedirLogin({
        id: card.id,
        name: card.name,
        namePt: card.namePt,
        imageUrl: card.imageUrl,
        images: card.images,
        setName: card.setName,
        rarity: card.rarity,
        collectorNumber: card.collectorNumber,
        price: formatPrice(headlineBrl),
        change: changePercent,
      });
    },
    // Uma invalidação cobre lista, detalhes, stats e histórico
    aoGravar: invalidateCollection,
    nomePortfolio: portfolios.find((p) => p.id === activePortfolioId)?.name,
  });

  if (loading) return <CardDetailSkeleton />;

  if (error || !card) {
    return (
      <main className="max-w-370 mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <IconAlertCircle className="size-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">
          {naoExiste
            ? "Carta não encontrada"
            : "Não foi possível abrir a carta"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {naoExiste ? "A carta solicitada não existe no catálogo." : error}
        </p>
        <Button asChild>
          <Link href="/explore">Voltar ao Explorar</Link>
        </Button>
      </main>
    );
  }

  const latestPrice = precoAtual(card.prices);
  const previousPrice = precoAnterior(card.prices);
  const priceChange = latestPrice - previousPrice;
  const changePercent =
    previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;
  const isPositive = changePercent >= 0;

  const currentPortfolioQuantity = ownedQtyActive;
  const currentPortfolioValue = currentPortfolioQuantity * latestPrice;

  // Preço internacional (ver adr/0002): headline em BRL convertido + USD/câmbio.
  const intl = card.internationalPrice ?? null;
  const headlineBrl = intl?.brl ?? latestPrice;

  const priceHistory = card.prices
    .slice()
    .reverse()
    .map((p) => ({
      date: new Date(p.createdAt),
      price: p.value,
    }));

  return (
    <main className="max-w-370 mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {fromPortfolio ? (
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push(
                  portfolioId && portfolioId !== "default"
                    ? `/portfolio?id=${portfolioId}`
                    : "/portfolio",
                );
              }
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground group"
          >
            <IconChevronLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
            <span>Voltar ao portfólio</span>
          </button>

          <div className="hidden md:block">
            <Trilha
              className="text-sm"
              niveis={[
                { label: "Sets", href: "/sets" },
                {
                  label: card.tcg?.name ?? "TCG",
                  href: `/sets/${card.tcg?.slug ?? ""}`,
                },
                ...(card.set
                  ? [
                      {
                        label:
                          card.set.name ?? card.setName ?? card.setCode ?? "",
                        href: `/sets/${card.tcg?.slug ?? ""}/${card.set.slug}`,
                      },
                    ]
                  : []),
              ]}
              atual={cardName(card)}
            />
          </div>
        </div>
      ) : (
        <Trilha
          className="text-sm"
          niveis={[
            { label: "Sets", href: "/sets" },
            {
              label: card.tcg?.name ?? "TCG",
              href: `/sets/${card.tcg?.slug ?? ""}`,
            },
            ...(card.set
              ? [
                  {
                    label: card.set.name ?? card.setName ?? card.setCode ?? "",
                    href: `/sets/${card.tcg?.slug ?? ""}/${card.set.slug}`,
                  },
                ]
              : []),
          ]}
          atual={cardName(card)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          {/* A raridade não se repete no título: está na linha de baixo e,
              quase sempre, no próprio nome ("… (Starlight Rare)"). */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {cardName(card)}
          </h1>
          {cardNameEn(card) && (
            <p className="text-muted-foreground text-base mt-1">
              {cardNameEn(card)}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
            <Link
              href={
                card.set
                  ? `/sets/${card.tcg?.slug ?? ""}/${card.set.slug}`
                  : `/sets/${card.tcg?.slug ?? ""}`
              }
              className="text-base text-tertiary hover:text-tertiary-hover underline underline-offset-2 transition-colors font-medium"
            >
              {card.set?.name ?? card.setName ?? card.setCode}
            </Link>
            <span className="text-muted-foreground">•</span>
            <span className="text-base text-muted-foreground">
              {nomeDaRaridade(card.rarity, card.tcgId)}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-base text-muted-foreground font-mono">
              {card.collectorNumber}
            </span>
          </div>
        </div>

        {/* Preço internacional (estimado) — ver adr/0002 */}
        {/* Solto no canto, como no Collectr: a caixa em volta era mais uma
            moldura na página. */}
        <div className="flex flex-col gap-1 md:items-end md:text-right">
          <span className="text-xs text-tertiary uppercase tracking-wider font-semibold flex items-center gap-1">
            <IconWorld className="size-3.5" />
            Preço internacional (estimado)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-foreground font-mono">
              R$ {formatPrice(headlineBrl)}
            </span>
            {headlineBrl > 0 && latestPrice > 0 && (
              <div
                className={cn(
                  "flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full shrink-0",
                  isPositive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-rose-500/10 text-rose-400",
                )}
              >
                {isPositive ? (
                  <IconTrendingUp className="size-3" />
                ) : (
                  <IconTrendingDown className="size-3" />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {changePercent.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {[
              intl?.usd != null ? `US$ ${intl.usd.toFixed(2)}` : null,
              intl?.rate != null ? `câmbio ${intl.rate.toFixed(2)}` : null,
              intl?.source ?? "TCGplayer",
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Card Image — object-contain garante a carta INTEIRA (sem
            cortar borda); a proporção real varia por TCG, então nada de
            aspect fixo com cover. */}
        <div className="lg:col-span-3">
          <div className="sticky top-20">
            <CardImage
              carta={card}
              tamanho="cheia"
              alt={cardName(card)}
              width={400}
              height={560}
              sizes="(max-width: 1024px) 90vw, 22vw"
              className="mx-auto h-auto w-full rounded-2xl"
              // É a imagem principal da página: sem priority o next/image a
              // carrega em lazy e ela era a última coisa a aparecer.
              priority
            />
          </div>
        </div>

        {/* Center: Chart + Details */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-card !rounded-2xl p-5">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <IconTrendingUp className="size-5 text-primary" />
              Histórico de Preço (Ungraded)
            </h2>
            {priceHistory.length > 1 ? (
              <AreaChart
                data={priceHistory}
                xDataKey="date"
                margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
                animationDuration={1200}
                aspectRatio="2.2 / 1"
              >
                <Grid
                  horizontal
                  vertical={false}
                  numTicksRows={4}
                  stroke="var(--chart-grid)"
                  strokeDasharray="4,4"
                />
                <Area
                  dataKey="price"
                  fill="var(--primary)"
                  fillOpacity={0.15}
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  gradientToOpacity={0.01}
                />
                <ChartTooltip
                  rows={(point) => [
                    {
                      color: "var(--primary)",
                      label: "Preço",
                      value: `R$ ${formatPrice(Number(point.price))}`,
                    },
                  ]}
                />
                <XAxis numTicks={6} />
              </AreaChart>
            ) : (
              <EstadoVazio
                compacto
                className="py-10"
                icon={IconTrendingUp}
                titulo={
                  priceHistory.length === 0
                    ? "Sem histórico de preço"
                    : "Histórico em construção"
                }
                descricao={
                  priceHistory.length === 0
                    ? "Ainda não há dados de preço para esta carta."
                    : `O gráfico aparece com mais dados. Preço atual: R$ ${formatPrice(priceHistory[0].price)}`
                }
              />
            )}
          </div>

          {/* Details */}
          <div className="glass-card !rounded-2xl p-5 space-y-5">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <IconAlertCircle className="size-5 text-tertiary" />
              Detalhes
            </h2>

            {card.description && (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                <TextoDaCarta html={card.description} />
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Raridade
                  </p>
                  <TagTutorialRaridade jogo={card.tcgId} />
                </div>
                <p className="text-base text-foreground font-medium">
                  {nomeDaRaridade(card.rarity, card.tcgId)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Código
                </p>
                <p className="text-base text-primary font-mono font-bold">
                  {card.collectorNumber}
                </p>
              </div>
              {card.cardType && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Tipo
                  </p>
                  <p className="text-base text-foreground font-medium">
                    {card.cardType}
                  </p>
                </div>
              )}
              {card.attribute && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Atributo
                  </p>
                  <p className="text-base text-foreground font-medium">
                    {card.attribute}
                  </p>
                </div>
              )}
              {card.atk != null && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    ATK / DEF
                  </p>
                  <p className="text-base text-foreground font-mono font-medium">
                    {card.atk} / {card.def ?? "?"}
                  </p>
                </div>
              )}
              {card.level != null && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Nível
                  </p>
                  <p className="text-base text-foreground font-mono font-medium">
                    {card.level}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Collection + Shop */}
        <div className="lg:col-span-4 space-y-5">
          <div className="glass-card !rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                {portfolios.length > 0 ? (
                  <PortfolioSelector
                    portfolios={portfolios}
                    activePortfolioId={activePortfolioId}
                    onSelect={setActivePortfolioId}
                    onRefresh={handleRefresh}
                    labelPrefix="Adicionando em"
                  />
                ) : (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>Adicionar a:</span>
                    <span className="font-semibold text-primary">
                      Coleção Principal
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right shrink-0 flex flex-col items-end">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Possui: {currentPortfolioQuantity}
                </span>
                <span className="text-sm text-muted-foreground font-mono font-bold">
                  Total: R$ {formatPrice(currentPortfolioValue)}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-semibold text-foreground">
                  Ungraded
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="text-xs font-bold h-7 px-2.5 border-border/80 bg-muted/30"
                >
                  NM
                </Badge>
                <div className="flex items-center gap-3">
                  <RollingCounter
                    value={qtd.quantidade}
                    onChange={qtd.definir}
                    min={qtd.minimo}
                    cell={36}
                    redondo
                    sucesso={qtd.sucesso}
                    sucessoId={qtd.sucessoId}
                    inercia={false}
                  />

                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1">
                      {isPositive ? (
                        <IconTrendingUp className="size-3.5 text-emerald-400" />
                      ) : (
                        <IconTrendingDown className="size-3.5 text-rose-400" />
                      )}
                      <span className="text-base font-bold text-foreground font-mono">
                        R$ {formatPrice(latestPrice)}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-mono",
                        isPositive ? "text-emerald-400" : "text-rose-400",
                      )}
                    >
                      {isPositive ? "+" : ""}BRL {changePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Holdings (Inventory) */}
          {session?.user && ownedItems.length > 0 && (
            <div className="glass-card !rounded-2xl p-5 space-y-3">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <IconPackage className="size-5 text-primary animate-in zoom-in duration-200" />
                Suas cópias (
                {ownedItems.reduce((acc, item) => acc + item.quantity, 0)})
              </h3>
              <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                {ownedItems.map((item) => {
                  const portfolioName =
                    portfolios.find((p) => p.id === item.portfolioId)?.name ??
                    "Coleção Principal";
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm py-1.5"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-foreground truncate">
                          {portfolioName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Condição: {item.condition}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-bold text-foreground">
                          {item.quantity}{" "}
                          {item.quantity === 1 ? "unidade" : "unidades"}
                        </p>
                        {item.buyPrice != null && (
                          <p className="text-xs text-muted-foreground font-mono">
                            Pago: R$ {formatPrice(item.buyPrice)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preço real nas lojas BR — links de conferência (ver adr/0002) */}
          <div className="glass-card !rounded-2xl p-5 space-y-1">
            <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <IconShoppingCart className="size-5 text-emerald-400" />
              Preço nas lojas BR
            </h3>

            {getSearchUrls(card.name, card.tcg?.slug, card.collectorNumber).map(
              (link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full py-2 px-2 -mx-2 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    {link.logo ? (
                      <span className="size-7 shrink-0 rounded-md bg-white overflow-hidden flex items-center justify-center">
                        <Image
                          src={link.logo}
                          alt={link.name}
                          width={28}
                          height={28}
                          className="size-7 object-cover"
                        />
                      </span>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-border bg-muted text-[9px] font-bold h-5 px-1.5"
                      >
                        {link.name}
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground group-hover:text-foreground">
                      {link.label}
                    </span>
                  </div>
                  <IconExternalLink
                    className={`size-4 ${link.color} opacity-50 group-hover:opacity-100 transition-opacity`}
                  />
                </a>
              ),
            )}
          </div>

          <ConviteAppCartao
            titulo="Tem esta carta?"
            texto="Escaneie no app e ela entra no seu portfólio."
          />
        </div>
      </div>
    </main>
  );
}
