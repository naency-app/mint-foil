"use client";

import { Area } from "@/components/charts/area";
import { AreaChart } from "@/components/charts/area-chart";
import Grid from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCard } from "@/hooks/use-cards";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import {
  AlertCircle,
  Check,
  ChevronRight,
  ExternalLink,
  Loader2,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Tag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { PortfolioSelector } from "@/app/components/PortfolioSelector";
import { type Portfolio, type CollectionItem } from "@/lib/api";
import { cn } from "@/lib/utils";

const storeConfig: Record<
  string,
  { color: string; label: string; logo?: string }
> = {
  LigaMagic: {
    color: "text-blue-400",
    label: "Ver no LigaMagic",
    logo: "/logos/sites/logo-ligamagic.png",
  },
  LigaPokemon: {
    color: "text-yellow-400",
    label: "Ver no LigaPokemon",
    logo: "/logos/sites/logo_ligapokemon.png",
  },
  LigaYugioh: {
    color: "text-purple-400",
    label: "Ver no LigaYugioh",
    logo: "/logos/sites/logo_ligayugioh.png",
  },
  LigaOnePiece: {
    color: "text-red-400",
    label: "Ver no LigaOnePiece",
    logo: "/logos/sites/logo_ligaonepiece.png",
  },
  EpicGame: {
    color: "text-emerald-400",
    label: "Ver na EpicGame",
    logo: storeFavicon("epicgame.com.br"),
  },
  MyPCards: {
    color: "text-orange-400",
    label: "Ver no MyPCards",
    logo: "/logos/sites/logo-mypcards.png",
  },
};

// Favicon de lojas sem logo embarcado (ex: EpicGame)
function storeFavicon(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

// Ícone da loja num slot de largura fixa (nomes alinham). favicon → chip quadrado; wordmark → largo.
function StoreLogo({ logo, name }: { logo?: string; name: string }) {
  return (
    <span className="flex w-16 shrink-0 items-center">
      {!logo ? (
        <span className="flex items-center justify-center size-7 rounded-md bg-muted">
          <ShoppingCart className="size-3.5 text-muted-foreground" />
        </span>
      ) : logo.startsWith("http") ? (
        <span className="flex items-center justify-center size-7 rounded-md bg-white overflow-hidden border border-border/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt={name} className="size-5 object-contain" />
        </span>
      ) : (
        <Image
          src={logo}
          alt={name}
          width={124}
          height={48}
          className="h-6 w-auto max-w-[60px] object-contain"
        />
      )}
    </span>
  );
}

function getSearchUrls(cardName: string, tcgSlug?: string) {
  const encoded = encodeURIComponent(cardName);
  const urls: {
    name: string;
    url: string;
    color: string;
    label: string;
    logo?: string;
    backgroundColor?: string;
  }[] = [];

  if (!tcgSlug || tcgSlug === "magic") {
    urls.push({
      name: "LigaMagic",
      url: `https://www.ligamagic.com.br/?view=cards/card&card=${encoded}`,
      color: "text-blue-400",
      backgroundColor: "bg-[#FF5A00]",
      label: "Buscar no LigaMagic",
      logo: "/logos/sites/logo-ligamagic.png",
    });
  }
  if (!tcgSlug || tcgSlug === "pokemon") {
    urls.push({
      name: "LigaPokemon",
      url: `https://www.ligapokemon.com.br/?view=cards/card&card=${encoded}`,
      color: "text-yellow-400",
      backgroundColor: "bg-[#FFFF]",
      label: "Buscar no LigaPokemon",
      logo: "/logos/sites/logo_ligapokemon.png",
    });
  }
  if (!tcgSlug || tcgSlug === "yugioh") {
    urls.push({
      name: "LigaYugioh",
      url: `https://www.ligayugioh.com.br/?view=cards/card&card=${encoded}`,
      color: "text-purple-400",
      backgroundColor: "bg-[#7C3AED]",
      label: "Buscar no LigaYugioh",
      logo: "/logos/sites/logo_ligayugioh.png",
    });
  }
  if (!tcgSlug || tcgSlug === "onepiece") {
    urls.push({
      name: "LigaOnePiece",
      url: `https://www.ligaonepiece.com.br/?view=cards/card&card=${encoded}`,
      color: "text-red-400",
      backgroundColor: "bg-[#EBA40F]",
      label: "Buscar no LigaOnePiece",
      logo: "/logos/sites/logo_ligaonepiece.png",
    });
  }
  // EpicGame: busca por nome (encoding de formulário — espaços viram '+')
  urls.push({
    name: "EpicGame",
    url: `https://www.epicgame.com.br/?view=ecom%2Fitens&id=461&searchExactMatch=&busca=${encodeURIComponent(cardName).replace(/%20/g, "+")}`,
    color: "text-emerald-400",
    label: "Buscar na EpicGame",
    logo: storeFavicon("epicgame.com.br"),
  });
  // MyPCards: URL de busca com parâmetros ProdutoSearch
  const myPTcg = tcgSlug ?? "yugioh";
  const myPParams = new URLSearchParams({
    "ProdutoSearch[marca]": myPTcg,
    "ProdutoSearch[query]": cardName,
  });
  urls.push({
    name: "MyPCards",
    url: `https://mypcards.com/${myPTcg}?${myPParams.toString()}`,
    color: "text-orange-400",
    label: "Buscar no MyPCards",
    logo: "/logos/sites/logo-mypcards.png",
  });

  return urls;
}

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function CardDetailSkeleton() {
  return (
    <main className="max-w-370 mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Skeleton className="h-4 w-64" />
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-3">
          <Skeleton className="w-full aspect-5/7 rounded-xl" />
        </div>
        <div className="lg:col-span-5 space-y-5">
          <Skeleton className="w-full h-64 rounded-xl" />
          <Skeleton className="w-full h-48 rounded-xl" />
        </div>
        <div className="lg:col-span-4 space-y-5">
          <Skeleton className="w-full h-56 rounded-xl" />
          <Skeleton className="w-full h-40 rounded-xl" />
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

  const { card, loading, error } = useCard(id);
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

  const LIGA_STORE_NAMES = [
    "LigaYugioh",
    "LigaMagic",
    "LigaPokemon",
    "LigaOnePiece",
  ];
  const brPrice = (() => {
    const liga = card.storeLinks?.find(
      (l) => LIGA_STORE_NAMES.includes(l.storeName) && l.price != null,
    );
    if (liga?.price != null) return liga.price;
    return (
      card.storeLinks
        ?.filter(
          (l) => l.storeName === "EpicGame" && l.price != null && l.inStock,
        )
        .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))[0]?.price ?? null
    );
  })();

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
      toast.success(`${card!.name} adicionado à coleção!`);
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

        {/* Pricing Card */}
        <div className="flex flex-wrap items-center gap-3">
          {(() => {
            const displayPrice = brPrice ?? latestPrice;
            return (
              <div className="rounded-xl border border-border/80 bg-card/40 backdrop-blur-xs p-3 min-w-[160px] flex flex-col gap-0.5 shadow-xs">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Preço médio das lojas
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black text-foreground font-mono">
                    {displayPrice > 0 ? `R$ ${formatPrice(displayPrice)}` : "Sem preço"}
                  </span>
                  {latestPrice > 0 && changePercent !== 0 && (
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
                {displayPrice > 0 && (
                  <span className="text-[10px] text-emerald-400 font-medium">
                    lojas BR (NM)
                  </span>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Card Image */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-3 sticky top-20">
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
          <div className="rounded-xl border border-border bg-card backdrop-blur-sm p-4">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Histórico de Preço (lojas BR)
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
                  fill="#EF1556"
                  fillOpacity={0.15}
                  stroke="#EF1556"
                  strokeWidth={2.5}
                  gradientToOpacity={0.01}
                />
                <ChartTooltip
                  rows={(point) => [
                    {
                      color: "#EF1556",
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
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="size-4 text-blue-400" />
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
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 space-y-4">
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
                  Condição
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
            <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 space-y-3">
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

          {/* Store Links - Onde Comprar */}
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <ShoppingCart className="size-3.5 text-emerald-400" />
              Onde Comprar
            </h3>

            {/* Disponível nas lojas (com preço) */}
            {(() => {
              const priced = (card.storeLinks ?? [])
                .filter((l) => l.price != null)
                .sort((a, b) => (a.price as number) - (b.price as number));
              const cheapest = priced[0]?.price ?? null;
              if (priced.length === 0) return null;
              return (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Disponível nas lojas
                  </p>
                  <div className="divide-y divide-border/60">
                    {priced.map((link) => {
                      const config = storeConfig[link.storeName];
                      const best = link.price === cheapest;
                      return (
                        <a
                          key={link.id}
                          href={link.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <StoreLogo logo={config?.logo} name={link.storeName} />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {link.storeName}
                              </p>
                              {link.inStock ? (
                                <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                                  <span className="size-1.5 rounded-full bg-emerald-400" />
                                  em estoque
                                </span>
                              ) : (
                                <span className="text-[11px] text-muted-foreground">
                                  indisponível
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {best && (
                              <Badge className="bg-primary/15 text-primary border-0 text-[9px] font-bold gap-0.5 h-5">
                                <Tag className="size-2.5" /> menor preço
                              </Badge>
                            )}
                            <span
                              className={cn(
                                "text-sm font-extrabold font-mono",
                                best ? "text-primary" : "text-foreground",
                              )}
                            >
                              R$ {formatPrice(link.price as number)}
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Buscar nas lojas */}
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Buscar nas lojas
              </p>
              <div className="divide-y divide-border/60">
                {getSearchUrls(card.name, card.tcg?.slug).map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <StoreLogo logo={link.logo} name={link.name} />
                      <span className="text-sm font-medium text-foreground truncate">
                        {link.name}
                      </span>
                    </div>
                    <ExternalLink
                      className={`size-4 ${link.color} opacity-50 group-hover:opacity-100 transition-opacity shrink-0`}
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
