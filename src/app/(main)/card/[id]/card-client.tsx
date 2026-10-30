"use client";

import {
  IconAlertCircle,
  IconArrowUpRight,
  IconCards,
  IconCash,
  IconChevronRight,
  IconPackage,
  IconTrendingDown,
  IconTrendingUp,
  IconWorld,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CardImage } from "@/app/components/CardImage";
import { ConviteAppCartao } from "@/app/components/ConviteApp";
import {
  BotaoNovoPortfolio,
  DialogoNovoPortfolio,
} from "@/app/components/DialogoNovoPortfolio";
import { PortfolioSelector } from "@/app/components/PortfolioSelector";
import { useQuickAdd } from "@/app/components/QuickAdd";
import { RollingCounter } from "@/app/components/RollingCounter";
import { TagTutorialRaridade } from "@/app/components/TagTutorialRaridade";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { Area } from "@/components/charts/area";
import { AreaChart } from "@/components/charts/area-chart";
import Grid from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { EstadoVazio } from "@/components/EstadoVazio";
import { Trilha } from "@/components/Trilha";
import { Button } from "@/components/ui/button";
import { CountingNumber } from "@/components/ui/counting-number";
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

/**
 * Busca da carta na MyPCards, para quando ela ainda não tem preço da MyP (com
 * preço, o link vai direto ao produto). A MyP fica sempre em destaque no card
 * de preço, com ou sem preço (30/10).
 */
function buscaNaMyp(
  cardName: string,
  tcgSlug?: string,
  collectorNumber?: string | null,
): string {
  const ligaCode = ligaSearchCode(collectorNumber);
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
  return myPUrl;
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
    label: string;
    logo?: string;
  }[] = [];

  // Favicons dos sites (fundo de marca embutido) — legíveis nos dois temas,
  // diferente dos wordmarks transparentes que sumiam no light.
  if (!tcgSlug || tcgSlug === "magic") {
    urls.push({
      name: "LigaMagic",
      url: ligaUrl("https://www.ligamagic.com.br", cardName, ligaCode),
      label: "Liga Magic",
      logo: "/logos/sites/favicons/ligamagic.png",
    });
  }
  if (!tcgSlug || tcgSlug === "pokemon") {
    urls.push({
      name: "LigaPokemon",
      url: ligaUrl("https://www.ligapokemon.com.br", cardName, ligaCode),
      label: "Liga Pokémon",
      logo: "/logos/sites/favicons/ligapokemon.png",
    });
  }
  if (!tcgSlug || tcgSlug === "yugioh") {
    urls.push({
      name: "LigaYugioh",
      url: ligaUrl("https://www.ligayugioh.com.br", cardName, ligaCode),
      label: "Liga Yu-Gi-Oh!",
      logo: "/logos/sites/favicons/ligayugioh.png",
    });
  }
  if (!tcgSlug || tcgSlug === "onepiece") {
    urls.push({
      name: "LigaOnePiece",
      url: ligaUrl("https://www.ligaonepiece.com.br", cardName, ligaCode),
      label: "Liga One Piece",
      logo: "/logos/sites/favicons/ligaonepiece.png",
    });
  }
  if (!tcgSlug || tcgSlug === "lorcana") {
    urls.push({
      name: "LigaLorcana",
      url: ligaUrl("https://www.ligalorcana.com.br", cardName, ligaCode),
      label: "Liga Lorcana",
      logo: "/logos/sites/favicons/ligalorcana.png",
    });
  }
  if (!tcgSlug || tcgSlug === "digimon") {
    urls.push({
      name: "LigaDigimon",
      url: ligaUrl("https://www.ligadigimon.com.br", cardName, ligaCode),
      label: "Liga Digimon",
      logo: "/logos/sites/favicons/ligadigimon.png",
    });
  }
  // A LigaDragonBall cobre os dois jogos de Dragon Ball (24/10)
  if (!tcgSlug || tcgSlug === "dragonball" || tcgSlug === "fusionworld") {
    urls.push({
      name: "LigaDragonBall",
      url: ligaUrl("https://www.ligadragonball.com.br", cardName, ligaCode),
      label: "Liga Dragon Ball",
      logo: "/logos/sites/favicons/ligadragonball.png",
    });
  }
  // EpicGame, igual ao app (store-list.tsx): busca pelo nome, que ela
  // aceita em formulário — espaço vira "+" (ficou de fora da web desde a
  // virada para o preço internacional, 26/10)
  urls.push({
    name: "EpicGame",
    url: `https://www.epicgame.com.br/?view=ecom%2Fitens&id=461&searchExactMatch=&busca=${encodeURIComponent(cardName).replace(/%20/g, "+")}`,
    label: "EpicGame",
    logo: "/logos/sites/favicons/epicgame.png",
  });
  return urls;
}

/**
 * Uma loja: logo, nome e a ação, numa linha com fundo leve e espaço entre
 * uma e outra (sem borda nem fio separando, 30/10). `destaque` é a MyP:
 * fundo rosa claro e "Confira na loja" em rosa; nas demais, só a seta.
 */
function LinhaDeLoja({
  nome,
  url,
  logo,
  acao,
  destaque,
}: {
  nome: string;
  url: string;
  logo?: string;
  acao: string;
  destaque?: boolean;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${nome}: ${acao}`}
      className={cn(
        // Sem o contorno de foco do navegador, que aparecia como uma borda ao
        // voltar da aba da loja (30/10); o foco pelo teclado escurece o fundo
        "group flex items-center gap-3 rounded-xl px-3 outline-none transition-colors",
        destaque
          ? "bg-primary/10 py-2.5 hover:bg-primary/15 focus-visible:bg-primary/20"
          : "bg-muted/40 py-2 hover:bg-muted/70 focus-visible:bg-muted/80",
      )}
    >
      {logo && (
        <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white">
          <Image
            src={logo}
            alt=""
            width={28}
            height={28}
            className="size-7 object-cover"
          />
        </span>
      )}
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm text-foreground",
          destaque ? "font-semibold" : "font-medium",
        )}
      >
        {nome}
      </span>
      {destaque ? (
        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
          {acao}
          <IconArrowUpRight className="size-3.5" />
        </span>
      ) : (
        <IconArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
      )}
    </a>
  );
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
  const outrasCopias = useMemo(
    () => ownedItems.filter((item) => item.portfolioId !== activePortfolioId),
    [ownedItems, activePortfolioId],
  );

  // Qual portfólio fica ativo quando a lista chega (favorito > salvo > primeiro).
  useEffect(() => {
    if (portfolios.length === 0) return;
    const alvo = resolveActiveId(portfolios, storeActiveId, favoriteIds);
    if (alvo && alvo !== storeActiveId) setActivePortfolioId(alvo);
  }, [portfolios, storeActiveId, favoriteIds, setActivePortfolioId]);

  const invalidateCollection = useInvalidateCollection();
  const [novoPortfolioAberto, setNovoPortfolioAberto] = useState(false);
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

  // Preço internacional (ver adr/0002): headline em BRL convertido + USD/câmbio.
  const intl = card.internationalPrice ?? null;
  const headlineBrl = intl?.brl ?? latestPrice;
  // Preço BR da MyP (menor anunciado): quando vem, é ele a manchete
  const myp = card.precoMyp ?? null;
  // O total vale pelo preço da carta: o da MyP quando existe, senão o internacional
  const currentPortfolioValue =
    currentPortfolioQuantity * (myp?.menor ?? latestPrice);
  const detalheIntl = [
    intl?.usd != null ? `US$ ${intl.usd.toFixed(2)}` : null,
    intl?.rate != null ? `câmbio ${intl.rate.toFixed(2)}` : null,
    intl?.source ?? "TCGplayer",
  ]
    .filter(Boolean)
    .join(" · ");
  // Com a MyP na manchete, o internacional vira uma linha de referência com
  // o valor em real depois do câmbio: "US$ 5.99 · câmbio 4.96 · R$ 29,74 ·
  // TCGplayer" (30/10)
  const intlAntesDoReal = [
    intl?.usd != null ? `US$ ${intl.usd.toFixed(2)}` : null,
    intl?.rate != null ? `câmbio ${intl.rate.toFixed(2)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const fonteIntl = intl?.source ?? "TCGplayer";

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
          <BotaoVoltar
            rotulo="Voltar ao portfólio"
            padrao={{
              label: "Voltar ao portfólio",
              href:
                portfolioId && portfolioId !== "default"
                  ? `/portfolio?id=${portfolioId}`
                  : "/portfolio",
            }}
          />

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
          voltar={
            // Quem abriu a carta direto (Google, link) volta ao Explorar: a
            // coleção já tem o link roxo logo abaixo do nome, e como "voltar"
            // levava para onde a pessoa nunca esteve (30/10)
            <BotaoVoltar padrao={{ label: "Explorar", href: "/explore" }} />
          }
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

        {/* Centro e direita num grid só: na primeira linha o gráfico e o
            preço da carta, que ficam da mesma altura; embaixo os detalhes e
            o adicionar ao portfólio. Em colunas separadas cada uma crescia
            sozinha e o card de preço não batia com o gráfico (30/10). */}
        <div className="lg:col-span-9 grid grid-cols-1 lg:grid-cols-9 gap-5">
          <div className="lg:col-span-5 glass-card !rounded-2xl p-5">
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

          {/* Preço da carta, na mesma linha (e altura) do gráfico: o preço à
              direita, o internacional, quem fornece o preço em real, o botão
              da MyP e as demais lojas (30/10, desenho da Isa) */}
          <div className="lg:col-span-4 glass-card !rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              {myp ? (
                <IconCash className="size-5 text-primary" />
              ) : (
                <IconWorld className="size-5 text-primary" />
              )}
              {/* Com a MyP, o número é o menor anúncio dela: é o preço que a
                  própria MyP põe como principal (30/10) */}
              {myp
                ? "Preço em real (mínimo)"
                : "Preço internacional (estimado)"}
            </h3>

            <div className="flex flex-col items-end gap-1 text-right">
              <div className="flex items-center gap-2">
                {!myp && headlineBrl > 0 && latestPrice > 0 && (
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
                <span className="text-3xl font-black text-foreground font-mono">
                  R$ {formatPrice(myp ? myp.menor : headlineBrl)}
                </span>
              </div>
              {/* Sem a MyP, o internacional é a manchete e esta é a linha dele */}
              {!myp && (
                <span className="text-sm text-muted-foreground">
                  {detalheIntl}
                </span>
              )}
              {/* Atribuição exigida pela MYP (link para mypcards.com), sempre
                  acima do botão, com ou sem preço dela na carta (decisão da
                  Isa, 30/10): sem ela o acesso à API pode ser pausado */}
              <span className="text-xs text-muted-foreground">
                O preço em real é disponibilizado pela{" "}
                <a
                  href="https://mypcards.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-muted-foreground/40 underline-offset-2 transition-colors hover:text-foreground"
                >
                  MYP Cards
                </a>
              </span>
              {/* Com a MyP: o internacional logo abaixo da frase, no mesmo
                  tamanho dela */}
              {/* Só o valor em real um pouco maior que o resto da linha */}
              {myp && (
                <span className="text-xs text-muted-foreground">
                  {intlAntesDoReal && `${intlAntesDoReal} · `}
                  {headlineBrl > 0 && (
                    <>
                      <span className="text-sm">
                        R$ {formatPrice(headlineBrl)}
                      </span>
                      {" · "}
                    </>
                  )}
                  {fonteIntl}
                </span>
              )}
            </div>

            {/* A MyP sempre em destaque: com preço, o link vai ao produto;
                sem, à busca da carta na loja */}
            <LinhaDeLoja
              nome="MYP Cards"
              url={
                myp?.link ??
                buscaNaMyp(card.name, card.tcg?.slug, card.collectorNumber)
              }
              logo="/logos/sites/favicons/mypcards.png"
              acao="Confira na loja"
              destaque
            />

            <div className="mt-2 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Demais lojas
              </p>
              <div className="space-y-1.5">
                {getSearchUrls(
                  card.name,
                  card.tcg?.slug,
                  card.collectorNumber,
                ).map((link) => (
                  <LinhaDeLoja
                    key={link.name}
                    nome={link.label}
                    url={link.url}
                    logo={link.logo}
                    acao="Buscar"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Linha 2: detalhes à esquerda, cada coluna no seu tamanho */}
          <div className="lg:col-span-5 lg:self-start">
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

          {/* Coluna da direita da linha 2: adicionar, outras cópias e o
              convite empilhados. O card de adicionar fica do tamanho dele:
              esticado junto com Detalhes grandes ele sobrava vazio (30/10). */}
          <div className="lg:col-span-4 lg:self-start space-y-5">
            {/* Adicionar ao portfólio: onde, quantas e quanto valem as suas
              cópias. O valor das cópias vem menor que o preço da carta, de
              propósito: são dois números, e o importante é o de cima. */}
            <div className="glass-card !rounded-2xl p-5 space-y-4">
              {/* Título com o ícone do Portfólio (o mesmo do menu): a pasta com
                  "+" era igual à do botão de criar portfólio e confundia (30/10).
                  O "Ver portfólio" sobe para a linha do título. */}
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <IconCards className="size-5 text-primary" />
                  Adicionar ao portfólio
                </h3>
                {session?.user && activePortfolioId && (
                  <Link
                    href="/portfolio"
                    className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
                  >
                    Ver portfólio
                    <IconChevronRight className="size-3.5" />
                  </Link>
                )}
              </div>
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  {portfolios.length > 0 ? (
                    <PortfolioSelector
                      portfolios={portfolios}
                      activePortfolioId={activePortfolioId}
                      onSelect={setActivePortfolioId}
                      onRefresh={handleRefresh}
                      labelPrefix="Em"
                    />
                  ) : (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>Em</span>
                      <span className="font-semibold text-primary">
                        Coleção Principal
                      </span>
                    </div>
                  )}
                  {session?.user && (
                    <BotaoNovoPortfolio
                      onClick={() => setNovoPortfolioAberto(true)}
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
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
                <div className="text-right">
                  <span className="block text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Suas cópias valem
                  </span>
                  <span className="text-base font-bold text-foreground font-mono">
                    {/* Conta até o valor novo ao adicionar/remover */}
                    R${" "}
                    <CountingNumber
                      value={currentPortfolioValue}
                      decimals={2}
                    />
                  </span>
                </div>
              </div>
            </div>

            {/* Cópias em OUTROS portfólios: as do ativo já estão no card de
              cima (quantidade e total), repetir aqui era a mesma informação.
              Chega depois do resto da página (é do usuário), então entra com
              movimento; cada linha leva ao portfólio dela (26/10) */}
            <AnimatePresence initial={false}>
              {session?.user && outrasCopias.length > 0 && (
                <motion.div
                  key="suas-copias"
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-card !rounded-2xl p-5 space-y-3"
                >
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <IconPackage className="size-5 text-primary" />
                    Também nos seus portfólios (
                    {outrasCopias.reduce((acc, item) => acc + item.quantity, 0)}
                    )
                  </h3>
                  <div className="space-y-1 max-h-[180px] overflow-y-auto custom-scrollbar">
                    {outrasCopias.map((item, i) => {
                      const portfolioName =
                        portfolios.find((p) => p.id === item.portfolioId)
                          ?.name ?? "Coleção Principal";
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.12 + i * 0.05,
                            duration: 0.25,
                          }}
                        >
                          {/* O portfólio ativo é o do store compartilhado: marcar
                            antes de navegar faz a página abrir nele */}
                          <Link
                            href="/portfolio"
                            onClick={() =>
                              setActivePortfolioId(item.portfolioId)
                            }
                            className="flex items-center justify-between text-sm py-1.5 px-2 -mx-2 rounded-lg hover:bg-muted transition-colors group"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-semibold text-foreground truncate">
                                {portfolioName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Condição: {item.condition}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="text-right">
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
                              <IconChevronRight className="size-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <ConviteAppCartao
              titulo="Tem esta carta?"
              texto="Escaneie no app e ela entra no seu portfólio."
            />

            <DialogoNovoPortfolio
              open={novoPortfolioAberto}
              onOpenChange={setNovoPortfolioAberto}
              onCriado={async (p) => {
                await invalidateCollection();
                setActivePortfolioId(p.id);
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
