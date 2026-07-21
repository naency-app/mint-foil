"use client";

import {
  AlertCircle,
  Check,
  ChevronRight,
  ExternalLink,
  Globe,
  Loader2,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PortfolioSelector } from "@/app/components/PortfolioSelector";
import { Area } from "@/components/charts/area";
import { AreaChart } from "@/components/charts/area-chart";
import Grid from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type CollectionItem, type Portfolio } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useCardDetail } from "@/lib/queries";
import { cn } from "@/lib/utils";

function getSearchUrls(
  cardName: string,
  tcgSlug?: string,
  collectorNumber?: string | null,
) {
  const encoded = encodeURIComponent(cardName);
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
      url: `https://www.ligamagic.com.br/?view=cards/card&card=${encoded}`,
      color: "text-blue-400",
      label: "Buscar no LigaMagic",
      logo: "/logos/sites/favicons/ligamagic.png",
    });
  }
  if (!tcgSlug || tcgSlug === "pokemon") {
    urls.push({
      name: "LigaPokemon",
      url: `https://www.ligapokemon.com.br/?view=cards/card&card=${encoded}`,
      color: "text-yellow-400",
      label: "Buscar no LigaPokemon",
      logo: "/logos/sites/favicons/ligapokemon.png",
    });
  }
  if (!tcgSlug || tcgSlug === "yugioh") {
    urls.push({
      name: "LigaYugioh",
      url: `https://www.ligayugioh.com.br/?view=cards/card&card=${encoded}`,
      color: "text-purple-400",
      label: "Buscar no LigaYugioh",
      logo: "/logos/sites/favicons/ligayugioh.png",
    });
  }
  if (!tcgSlug || tcgSlug === "onepiece") {
    urls.push({
      name: "LigaOnePiece",
      url: `https://www.ligaonepiece.com.br/?view=cards/card&card=${encoded}`,
      color: "text-red-400",
      label: "Buscar no LigaOnePiece",
      logo: "/logos/sites/favicons/ligaonepiece.png",
    });
  }
  // MyPCards: a página de produto usa um ID interno (ex.: /yugioh/produto/311239/…)
  // que não temos como derivar — o link de conferência vai pra busca, com o
  // código de colecionador quando houver (mais preciso que o nome).
  const myPTcg = tcgSlug ?? "yugioh";
  const myPUrl = `https://mypcards.com/${myPTcg}?${new URLSearchParams({
    "ProdutoSearch[marca]": myPTcg,
    "ProdutoSearch[query]": collectorNumber ?? cardName,
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
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-5 w-56" />
        </div>
        <div className="glass-card !rounded-xl p-3.5 min-w-[220px] space-y-1.5">
          <Skeleton className="h-3 w-44" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-7 w-56" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Imagem (aspect idêntico ao real) */}
        <div className="lg:col-span-3">
          <div className="glass-card !rounded-xl p-3">
            <Skeleton className="w-full aspect-5/7 rounded-xl" />
          </div>
        </div>

        {/* Chart + detalhes */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-card !rounded-xl p-4 space-y-4">
            <Skeleton className="h-4 w-52" />
            <Skeleton className="w-full aspect-[2.2/1] rounded-lg" />
          </div>
          <div className="glass-card !rounded-xl p-4 space-y-4">
            <Skeleton className="h-4 w-24" />
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
          <div className="glass-card !rounded-xl p-4 space-y-4">
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
          <div className="glass-card !rounded-xl p-4 space-y-3">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-full" />
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

export default function CardDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ portfolioId?: string }>;
}) {
  const { id } = use(params);
  const sParams = use(searchParams);
  const queryPortfolioId = sParams?.portfolioId;

  const cardQuery = useCardDetail(id);
  const card = cardQuery.data ?? null;
  const loading = cardQuery.isPending;
  const error = cardQuery.error ? cardQuery.error.message : null;
  const { data: session } = useSession();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolioId, setActivePortfolioId] = useState<string>("");
  const [ownedItems, setOwnedItems] = useState<CollectionItem[]>([]);
  const lastDelta = useRef(1);

  const fetchPortfolios = useCallback(() => {
    api.collection
      .portfolios()
      .then((data) => {
        const favsStr = localStorage.getItem("minty_favorite_portfolio_ids");
        let favs: string[] = [];
        if (favsStr) {
          try {
            favs = JSON.parse(favsStr) as string[];
          } catch {}
        } else {
          const oldDefault = localStorage.getItem("minty_default_portfolio_id");
          if (oldDefault) favs = [oldDefault];
        }

        const sortedPortfolios = [...data].sort((a, b) => {
          const aFav = favs.includes(a.id);
          const bFav = favs.includes(b.id);
          if (aFav && !bFav) return -1;
          if (!aFav && bFav) return 1;
          return 0;
        });

        setPortfolios(sortedPortfolios);

        if (sortedPortfolios.length > 0) {
          const foundFav = sortedPortfolios.find((p) => favs.includes(p.id));
          const oldDefault = localStorage.getItem("minty_default_portfolio_id");
          const hasOldStored = sortedPortfolios.some(
            (p) => p.id === oldDefault,
          );

          const nextActive =
            queryPortfolioId &&
            sortedPortfolios.some((p) => p.id === queryPortfolioId)
              ? queryPortfolioId
              : foundFav
                ? foundFav.id
                : hasOldStored && oldDefault
                  ? oldDefault
                  : sortedPortfolios[0].id;

          setActivePortfolioId((prev) => {
            if (prev && sortedPortfolios.some((p) => p.id === prev)) {
              return prev;
            }
            return nextActive;
          });
        }
      })
      .catch(() => {});
  }, [queryPortfolioId]);

  const fetchOwnedItems = useCallback(async () => {
    try {
      const portfs = await api.collection.portfolios();
      const results = await Promise.all(
        portfs.map(async (p) => {
          try {
            const res = await api.collection.getPortfolio(p.id);
            return {
              items: (res.items || []).map((item) => ({
                ...item,
                portfolioId: p.id,
              })),
            };
          } catch {
            return { items: [] };
          }
        }),
      );
      const allItems = results.flatMap((r) => r.items);
      const filtered = allItems.filter((item) => item.cardId === id);
      setOwnedItems(filtered);
    } catch {}
  }, [id]);

  const handleRefresh = useCallback(() => {
    fetchPortfolios();
    fetchOwnedItems();
  }, [fetchPortfolios, fetchOwnedItems]);

  useEffect(() => {
    if (session?.user) {
      fetchPortfolios();
      fetchOwnedItems();
    }
  }, [session, fetchPortfolios, fetchOwnedItems]);

  const handleQtyChange = (delta: number) => {
    lastDelta.current = delta;
    setQty((prev) => Math.max(1, prev + delta));
  };

  if (loading) return <CardDetailSkeleton />;

  if (error || !card) {
    return (
      <main className="max-w-370 mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <AlertCircle className="size-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">
          Carta não encontrada
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {error || "A carta solicitada não existe no catálogo."}
        </p>
        <Button asChild>
          <Link href="/explore">Voltar ao Explorar</Link>
        </Button>
      </main>
    );
  }

  const latestPrice = card.prices[0]?.value ?? 0;
  const previousPrice = card.prices[1]?.value ?? latestPrice;
  const priceChange = latestPrice - previousPrice;
  const changePercent =
    previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;
  const isPositive = changePercent >= 0;

  const currentPortfolioQuantity = ownedItems
    .filter((item) => item.portfolioId === activePortfolioId)
    .reduce((acc, item) => acc + item.quantity, 0);
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

  async function handleAddToCollection() {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    setAdding(true);
    try {
      await api.collection.add({
        cardId: id,
        quantity: qty,
        condition: "NM",
        buyPrice: latestPrice,
        portfolioId: activePortfolioId || undefined,
      });
      setAdded(true);
      toast.success(`${card?.name ?? "Carta"} adicionado à coleção!`);
      fetchOwnedItems();
      fetchPortfolios();
      setTimeout(() => setAdded(false), 3000);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao adicionar à coleção",
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <main className="max-w-370 mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/sets" className="hover:text-primary transition-colors">
          Sets
        </Link>
        <ChevronRight className="size-3" />
        <Link
          href={`/sets/${card.tcg?.slug ?? ""}`}
          className="hover:text-primary transition-colors"
        >
          {card.tcg?.name ?? "TCG"}
        </Link>
        {card.set && (
          <>
            <ChevronRight className="size-3" />
            <Link
              href={`/sets/${card.tcg?.slug ?? ""}/${card.set.slug}`}
              className="hover:text-primary transition-colors"
            >
              {card.set.name ?? card.setName ?? card.setCode}
            </Link>
          </>
        )}
        <ChevronRight className="size-3" />
        <span className="text-foreground truncate max-w-50">{card.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {card.name}{" "}
            <span className="text-muted-foreground font-normal text-lg">
              ({card.rarity})
            </span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Link
              href={
                card.set
                  ? `/sets/${card.tcg?.slug ?? ""}/${card.set.slug}`
                  : `/sets/${card.tcg?.slug ?? ""}`
              }
              className="text-sm text-tertiary hover:text-tertiary-hover underline underline-offset-2 transition-colors font-medium"
            >
              {card.set?.name ?? card.setName ?? card.setCode}
            </Link>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">{card.rarity}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground font-mono">
              {card.setCode}
            </span>
          </div>
        </div>

        {/* Preço internacional (estimado) — ver adr/0002 */}
        <div className="glass-card !rounded-xl p-3.5 min-w-[220px] flex flex-col gap-0.5">
          <span className="text-[10px] text-tertiary uppercase tracking-wider font-semibold flex items-center gap-1">
            <Globe className="size-3" />
            Preço internacional (estimado)
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black text-foreground font-mono">
              R$ {formatPrice(headlineBrl)}
            </span>
            {headlineBrl > 0 && latestPrice > 0 && (
              <div
                className={cn(
                  "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                  isPositive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-rose-500/10 text-rose-400",
                )}
              >
                {isPositive ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {changePercent.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {[
              intl?.usd != null ? `US$ ${intl.usd.toFixed(2)}` : null,
              intl?.rate != null ? `câmbio ${intl.rate.toFixed(2)}` : null,
              intl?.source ?? "TCGplayer",
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
          <span className="text-[10px] text-muted-foreground/80 leading-snug mt-1 max-w-[280px]">
            Valor de mercado internacional convertido. O preço nas lojas
            brasileiras pode variar — confira nos links abaixo.
          </span>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Card Image */}
        <div className="lg:col-span-3">
          <div className="glass-card !rounded-xl p-3 sticky top-20">
            <Image
              src={card.imageUrl}
              alt={card.name}
              width={400}
              height={560}
              className="w-full rounded-xl aspect-5/7 object-cover"
            />
          </div>
        </div>

        {/* Center: Chart + Details */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-card !rounded-xl p-4">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
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
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <TrendingUp className="size-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {priceHistory.length === 0
                    ? "Ainda não há dados de preço para esta carta."
                    : "Histórico em construção — o gráfico aparecerá com mais dados."}
                </p>
                {priceHistory.length === 1 && (
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Preço atual: R$ {formatPrice(priceHistory[0].price)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="glass-card !rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="size-4 text-tertiary" />
                Detalhes
              </h2>
            </div>

            {card.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {card.description}
              </p>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                  Raridade
                </p>
                <p className="text-xs text-foreground font-medium">
                  {card.rarity}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                  Código
                </p>
                <p className="text-xs text-foreground font-mono font-medium">
                  {card.setCode}
                </p>
              </div>
              {card.cardType && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    Tipo
                  </p>
                  <p className="text-xs text-foreground font-medium">
                    {card.cardType}
                  </p>
                </div>
              )}
              {card.attribute && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    Atributo
                  </p>
                  <p className="text-xs text-foreground font-medium">
                    {card.attribute}
                  </p>
                </div>
              )}
              {card.atk != null && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    ATK / DEF
                  </p>
                  <p className="text-xs text-foreground font-mono font-medium">
                    {card.atk} / {card.def ?? "?"}
                  </p>
                </div>
              )}
              {card.level != null && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    Nível
                  </p>
                  <p className="text-xs text-foreground font-mono font-medium">
                    {card.level}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Collection + Shop */}
        <div className="lg:col-span-4 space-y-5">
          <div className="glass-card !rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                {portfolios.length > 0 ? (
                  <PortfolioSelector
                    portfolios={portfolios}
                    activePortfolioId={activePortfolioId}
                    onSelect={setActivePortfolioId}
                    onRefresh={handleRefresh}
                    labelPrefix="Adicionar a:"
                  />
                ) : (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>Adicionar a:</span>
                    <span className="font-semibold text-primary">
                      Coleção Principal
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right shrink-0 flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Possui: {currentPortfolioQuantity}
                </span>
                <span className="text-xs text-muted-foreground font-mono font-bold">
                  Total: R$ {formatPrice(currentPortfolioValue)}
                </span>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Ungraded
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold h-6 px-2 border-border/80 bg-muted/30"
                >
                  NM
                </Badge>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.78 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 18,
                      }}
                      onClick={() => handleQtyChange(-1)}
                      className="size-8 rounded-full border border-border bg-card hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive text-muted-foreground flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Minus className="size-3.5" strokeWidth={2.5} />
                    </motion.button>

                    <div className="w-8 flex items-center justify-center overflow-hidden">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={qty}
                          initial={{
                            y: lastDelta.current > 0 ? 10 : -10,
                            opacity: 0,
                          }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{
                            y: lastDelta.current > 0 ? -10 : 10,
                            opacity: 0,
                          }}
                          transition={{ duration: 0.13 }}
                          className="text-sm font-bold text-foreground font-mono"
                        >
                          {qty}
                        </motion.span>
                      </AnimatePresence>
                    </div>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.78 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 18,
                      }}
                      onClick={() => handleQtyChange(1)}
                      className="size-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Plus className="size-3.5" strokeWidth={2.5} />
                    </motion.button>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1">
                      {isPositive ? (
                        <TrendingUp className="size-2.5 text-emerald-400" />
                      ) : (
                        <TrendingDown className="size-2.5 text-rose-400" />
                      )}
                      <span className="text-sm font-bold text-foreground font-mono">
                        R$ {formatPrice(latestPrice)}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-mono",
                        isPositive ? "text-emerald-400" : "text-rose-400",
                      )}
                    >
                      {isPositive ? "+" : ""}BRL {changePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 text-sm gap-2 cursor-pointer shadow-sm active:scale-98 transition-transform"
              onClick={handleAddToCollection}
              disabled={adding}
            >
              {adding ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Adicionando...
                </>
              ) : added ? (
                <>
                  <Check className="size-4" />
                  Adicionado!
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Adicionar ao Portfólio ({qty})
                </>
              )}
            </Button>
          </div>

          {/* User Holdings (Inventory) */}
          {session?.user && ownedItems.length > 0 && (
            <div className="glass-card !rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Package className="size-3.5 text-primary animate-in zoom-in duration-200" />
                Suas Cópias (
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
                      className="flex items-center justify-between text-xs py-1.5 border-b border-border/40 last:border-0"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-foreground truncate">
                          {portfolioName}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Condição: {item.condition}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-bold text-foreground">
                          {item.quantity}{" "}
                          {item.quantity === 1 ? "unidade" : "unidades"}
                        </p>
                        {item.buyPrice != null && (
                          <p className="text-[10px] text-muted-foreground font-mono">
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
          <div className="glass-card !rounded-xl p-4 space-y-1">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
              <ShoppingCart className="size-3.5 text-emerald-400" />
              Preço real nas lojas BR
            </h3>
            <p className="text-[10px] text-muted-foreground leading-snug mb-3">
              O preço do mercado brasileiro você confere direto na loja — clique
              para abrir a página desta carta.
            </p>

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
                    <span className="text-xs text-muted-foreground group-hover:text-foreground">
                      {link.label}
                    </span>
                  </div>
                  <ExternalLink
                    className={`size-3.5 ${link.color} opacity-50 group-hover:opacity-100 transition-opacity`}
                  />
                </a>
              ),
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
