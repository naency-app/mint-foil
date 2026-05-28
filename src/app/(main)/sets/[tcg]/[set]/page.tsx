"use client";

import { AddToPortfolioButton } from "@/app/components/AddToPortfolioButton";
import { TcgCard } from "@/app/components/TcgCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  api,
  type CardSet,
  type Card as CardType,
  type CollectionItem,
  type Portfolio,
} from "@/lib/api";
import { PortfolioSelector } from "@/app/components/PortfolioSelector";
import {
  IconFolder,
  IconLayoutGrid,
  IconListDetails,
} from "@tabler/icons-react";
import {
  ArrowLeft,
  ArrowUpDown,
  ChevronRight,
  Loader2,
  Search,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

type CollectionMap = Record<string, number>;

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getLatestPrice(card: CardType) {
  return card.prices[0]?.value ?? 0;
}

const LIGA_STORE_NAMES = [
  "LigaYugioh",
  "LigaMagic",
  "LigaPokemon",
  "LigaOnePiece",
];

function getBrPrice(card: CardType): number | null {
  const liga = card.storeLinks?.find(
    (l) => LIGA_STORE_NAMES.includes(l.storeName) && l.price != null,
  );
  if (liga?.price != null) return liga.price;
  return (
    card.storeLinks?.find(
      (l) => l.storeName === "EpicGame" && l.price != null && l.inStock,
    )?.price ?? null
  );
}

function getPriceChange(card: CardType) {
  if (card.prices.length < 2) return 0;
  const current = card.prices[0].value;
  const previous = card.prices[1].value;
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function CardSkeleton() {
  return (
    <Card className="w-full h-full overflow-hidden bg-card py-0">
      <CardContent className="p-0">
        <div className="p-2">
          <Skeleton className="w-full rounded-lg aspect-2/3" />
        </div>
      </CardContent>
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3 mt-2" />
      </div>
    </Card>
  );
}

function ListRow({
  card,
  activePortfolioId,
  quantity,
  onAdd,
}: {
  card: CardType;
  activePortfolioId: string;
  quantity: number;
  onAdd: () => void;
}) {
  const tcgPrice = getLatestPrice(card);
  const brPrice = getBrPrice(card);
  const displayPrice = brPrice ?? tcgPrice;

  return (
    <Link href={`/card/${card.id}`} className="block">
      <div className="flex items-center gap-4 px-4 py-3 rounded-lg border border-border bg-card hover:bg-background/50 transition-all group">
        <div className="shrink-0 size-12 rounded-md overflow-hidden">
          <Image
            src={card.imageUrl}
            alt={card.name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {card.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {card.rarity} • {card.setCode} • Qtd. {quantity}
          </p>
        </div>

        <div className="text-right shrink-0 w-32">
          <div className="flex items-center justify-end gap-1">
            <TrendingUp className="size-3 text-emerald-400" />
            <span className="text-sm font-bold text-foreground font-mono">
              R$ {formatPrice(displayPrice)}
            </span>
          </div>
          {brPrice == null && tcgPrice > 0 && (
            <span className="text-[9px] text-muted-foreground">
              ref. TCGPlayer
            </span>
          )}
          {brPrice != null && (
            <span className="text-[9px] text-emerald-400 font-medium">
              lojas BR
            </span>
          )}
        </div>

        <AddToPortfolioButton
          cardId={card.id}
          defaultPortfolioId={activePortfolioId}
          onSuccess={onAdd}
          triggerClassName="shrink-0 size-8 rounded-full border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
        />
      </div>
    </Link>
  );
}

function SetCardsPageContent() {
  const { tcg: tcgSlug, set: setSlug } = useParams<{
    tcg: string;
    set: string;
  }>();
  const [setInfo, setSetInfo] = useState<CardSet | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useQueryState("q", {
    defaultValue: "",
    throttleMs: 300,
  });
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useQueryState("sort", { defaultValue: "number" });

  // Portfolio states for collection progress
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolioId, setActivePortfolioId] = useState("");
  const [portfolioItems, setPortfolioItems] = useState<CollectionItem[]>([]);
  const [collectionMap, setCollectionMap] = useState<CollectionMap>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const set = await api.cards.setBySlug(tcgSlug, setSlug);
        setSetInfo(set);
        if (set) {
          const cardList = await api.cards.list(undefined, tcgSlug, set.id);
          setCards(cardList);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tcgSlug, setSlug]);

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

          const nextActive = foundFav
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
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const refreshPortfolio = useCallback(() => {
    if (!activePortfolioId) {
      setPortfolioItems([]);
      setCollectionMap({});
      return;
    }
    api.collection
      .getPortfolio(activePortfolioId)
      .then((data) => {
        setPortfolioItems(data.items);
        const map: CollectionMap = {};
        for (const item of data.items) {
          map[item.cardId] = (map[item.cardId] ?? 0) + item.quantity;
        }
        setCollectionMap(map);
      })
      .catch(() => {
        setPortfolioItems([]);
        setCollectionMap({});
      });
  }, [activePortfolioId]);

  useEffect(() => {
    refreshPortfolio();
  }, [refreshPortfolio]);

  // Compute set progress map: unique cards collected per set code
  const setProgressMap = useMemo(() => {
    const progressMap: Record<string, { count: number; value: number }> = {};
    for (const item of portfolioItems) {
      const setCode = item.card.set?.code ?? item.card.setCode;
      if (!setCode) continue;
      if (!progressMap[setCode]) {
        progressMap[setCode] = { count: 0, value: 0 };
      }
      progressMap[setCode].count += 1;
      progressMap[setCode].value +=
        (item.card.prices?.[0]?.value ?? 0) * item.quantity;
    }
    return progressMap;
  }, [portfolioItems]);

  const filteredCards = useMemo(() => {
    let result = cards;
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.setCode.toLowerCase().includes(term) ||
          (c.rarity && c.rarity.toLowerCase().includes(term)),
      );
    }

    return [...result].sort((a, b) => {
      const priceA = getBrPrice(a) ?? getLatestPrice(a);
      const priceB = getBrPrice(b) ?? getLatestPrice(b);
      switch (sortBy) {
        case "price-asc":
          return priceA - priceB;
        case "price-desc":
          return priceB - priceA;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "rarity":
          return b.rarity ? b.rarity.localeCompare(a.rarity ?? "") : 1;
        default:
          return a.setCode.localeCompare(b.setCode);
      }
    });
  }, [cards, search, sortBy]);

  const tcgName = setInfo?.tcg?.name ?? tcgSlug;

  return (
    <main className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
        <Link href="/sets" className="hover:text-foreground transition-colors">
          Sets
        </Link>
        <ChevronRight className="size-3" />
        <Link
          href={`/sets/${tcgSlug}`}
          className="hover:text-foreground transition-colors"
        >
          {tcgName}
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground">{setInfo?.name ?? setSlug}</span>
      </div>

      {/* Set Header with Info and Progress Bar */}
      <div>
        <Link
          href={`/sets/${tcgSlug}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 font-mono uppercase"
        >
          <ArrowLeft className="size-3" />
          Voltar para {tcgName}
        </Link>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        ) : setInfo ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border bg-card/45 gap-4">
            <div className="flex items-center gap-4">
              {setInfo.imageUrl && (
                <div className="relative w-[100px] h-[64px] rounded-lg bg-muted border border-border overflow-hidden shrink-0">
                  <Image
                    src={setInfo.imageUrl}
                    alt={setInfo.name}
                    fill
                    sizes="150px"
                    className="object-cover "
                  />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {setInfo.name}
                </h1>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] py-0 px-1.5 font-bold"
                  >
                    {setInfo.code}
                  </Badge>
                  <span>{cards.length} cartas catalogadas</span>
                  {setInfo.releaseDate && (
                    <span>
                      {new Date(setInfo.releaseDate).toLocaleDateString(
                        "pt-BR",
                        {
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Set Collection Progress Bar */}
            {(() => {
              const total = setInfo.totalCards ?? setInfo._count?.cards ?? 0;
              const collected = setProgressMap[setInfo.code]?.count ?? 0;
              const pct = total > 0 ? Math.min(collected / total, 1) : 0;
              if (total === 0) return null;
              return (
                <div className="flex flex-col gap-1 w-full md:w-56 shrink-0 pt-2 md:pt-0 border-t border-border/40 md:border-0">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground font-mono">
                    <span>Progresso da Coleção</span>
                    <span>
                      {collected}/{total} ({Math.round(pct * 100)}%)
                    </span>
                  </div>
                  <div className="bg-muted rounded-full h-1.5 overflow-hidden w-full">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct * 100}%` }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <h1 className="text-2xl font-bold text-foreground">
            Set não encontrado
          </h1>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar cartas..."
              className="pl-10"
            />
          </div>

          {portfolios.length > 0 && (
            <>
              <Separator
                orientation="vertical"
                className="h-5 hidden sm:block"
              />
              <PortfolioSelector
                portfolios={portfolios}
                activePortfolioId={activePortfolioId}
                onSelect={setActivePortfolioId}
                onRefresh={fetchPortfolios}
                labelPrefix="Adicionando a:"
              />
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-8 border-border bg-muted text-foreground text-xs min-w-[160px]">
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Número</SelectItem>
              <SelectItem value="price-asc">Preço: Menor → Maior</SelectItem>
              <SelectItem value="price-desc">Preço: Maior → Menor</SelectItem>
              <SelectItem value="name-asc">Nome: A → Z</SelectItem>
              <SelectItem value="name-desc">Nome: Z → A</SelectItem>
              <SelectItem value="rarity">Raridade</SelectItem>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6" />
          <ButtonGroup>
            <Button
              size="icon"
              variant={viewType === "grid" ? "default" : "outline"}
              onClick={() => setViewType("grid")}
              className="h-8 w-8"
            >
              <IconLayoutGrid className="size-4" />
            </Button>
            <Button
              size="icon"
              variant={viewType === "list" ? "default" : "outline"}
              onClick={() => setViewType("list")}
              className="h-8 w-8"
            >
              <IconListDetails className="size-4" />
            </Button>
          </ButtonGroup>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {loading ? (
          <span className="flex items-center gap-1">
            <Loader2 className="size-3 animate-spin" /> Carregando...
          </span>
        ) : (
          `${filteredCards.length} cartas encontradas`
        )}
      </p>

      {/* Cards Display */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="size-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Nenhuma carta encontrada
          </h3>
          <p className="text-sm text-muted-foreground">
            {search
              ? `Nenhum resultado para "${search}".`
              : "Este set ainda não possui cartas catalogadas."}
          </p>
        </div>
      ) : viewType === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredCards.map((card) => (
            <TcgCard
              key={card.id}
              name={card.name}
              price={formatPrice(getLatestPrice(card))}
              priceChange={
                card.prices.length >= 2
                  ? card.prices[0].value - card.prices[1].value
                  : 0
              }
              brPrice={getBrPrice(card)}
              imageUrl={card.imageUrl}
              setCode={card.setCode}
              setName={card.setName}
              tcgSlug={card.tcg?.slug}
              setSlug={card.set?.slug}
              rarity={card.rarity}
              change={getPriceChange(card)}
              cardId={card.id}
              cardHref={`/card/${card.id}`}
              quantity={collectionMap[card.id] ?? 0}
              defaultPortfolioId={activePortfolioId}
              onAdd={refreshPortfolio}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCards.map((card) => (
            <ListRow
              key={card.id}
              card={card}
              activePortfolioId={activePortfolioId}
              quantity={collectionMap[card.id] ?? 0}
              onAdd={refreshPortfolio}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default function SetCardsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="animate-spin text-primary size-8" />
        </div>
      }
    >
      <SetCardsPageContent />
    </Suspense>
  );
}
