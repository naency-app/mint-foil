"use client";

import { ProUpgradeModal } from "@/app/components/ProUpgradeModal";
import { TcgCard } from "@/app/components/TcgCard";
import { SetCard, getSetImageUrl } from "@/app/components/SetCard";
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
import { api, type Card as CardType, type Portfolio, type CollectionItem } from "@/lib/api";
import { TCG_CATALOG } from "@/lib/tcg-catalog";

import {
  IconFolder,
  IconLayoutGrid,
  IconListDetails,
  IconLoader2,
  IconPlus,
} from "@tabler/icons-react";
import {
  ArrowUpDown,
  ChevronRight,
  Clock,
  Layers,
  Loader2,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { sileo } from "sileo";

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

const LIGA_STORE_NAMES = ['LigaYugioh', 'LigaMagic', 'LigaPokemon', 'LigaOnePiece'];

function getBrPrice(card: CardType): number | null {
  const liga = card.storeLinks?.find(
    (l) => LIGA_STORE_NAMES.includes(l.storeName) && l.price != null,
  );
  if (liga?.price != null) return liga.price;
  return (
    card.storeLinks?.find((l) => l.storeName === "EpicGame" && l.price != null && l.inStock)
      ?.price ?? null
  );
}

function getPriceChange(card: CardType) {
  if (card.prices.length < 2) return 0;
  const current = card.prices[0].value;
  const previous = card.prices[1].value;
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function GridCardSkeleton() {
  return (
    <Card className="w-full h-full overflow-hidden dark:border dark:border-slate-800 bg-card py-0">
      <CardContent className="p-0">
        <div className="p-2">
          <Skeleton className="w-full rounded-lg aspect-2/3" />
        </div>
      </CardContent>
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-4 w-1/3 mt-2" />
      </div>
    </Card>
  );
}

function ListRow({
  card,
  activePortfolioId,
  onAdd,
}: {
  card: CardType;
  activePortfolioId: string;
  onAdd: () => void;
}) {
  const tcgPrice = getLatestPrice(card);
  const brPrice = getBrPrice(card);
  const displayPrice = brPrice ?? tcgPrice;
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (adding) return;
    if (!activePortfolioId) {
      router.push("/login");
      return;
    }
    setAdding(true);
    try {
      await api.collection.add({
        cardId: card.id,
        quantity: 1,
        condition: "NM",
        portfolioId: activePortfolioId,
      });
      sileo.success({ title: "Adicionado ao portfólio!" });
      onAdd();
    } catch {
      sileo.error({ title: "Erro ao adicionar carta" });
    } finally {
      setAdding(false);
    }
  }

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
        </div>

        <div className="hidden md:block flex-1 min-w-0">
          <p className="text-xs text-tertiary truncate">
            {card.setName ?? card.setCode}
          </p>
          <p className="text-xs text-muted-foreground">
            {card.rarity} • {card.setCode}
          </p>
          {card.cardType && (
            <p className="text-xs text-muted-foreground">{card.cardType}</p>
          )}
        </div>

        <div className="text-right shrink-0 w-36">
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

        <Button
          variant="outline"
          size="icon"
          className="shrink-0 size-8 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-200 duration-300"
          onClick={handleAdd}
          disabled={adding}
        >
          {adding ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconPlus className="size-4" />
          )}
        </Button>
      </div>
    </Link>
  );
}

export default function ExplorePage() {
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("best-match");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolioId, setActivePortfolioId] = useState("");
  const [portfolioItems, setPortfolioItems] = useState<CollectionItem[]>([]);
  const [collectionMap, setCollectionMap] = useState<CollectionMap>({});
  const [proModalOpen, setProModalOpen] = useState(false);

  // States mirroring mobile explore
  const [selectedTcg, setSelectedTcg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sets" | "cards">("sets");
  const [selectedSet, setSelectedSet] = useState<any | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [sets, setSets] = useState<any[]>([]);
  const [setsLoading, setSetsLoading] = useState(false);
  const [cards, setCards] = useState<CardType[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    const stored = localStorage.getItem("recent_searches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Save recent searches
  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const cleanTerm = term.trim();
    setRecentSearches((prev) => {
      const next = [cleanTerm, ...prev.filter((x) => x !== cleanTerm)].slice(0, 5);
      localStorage.setItem("recent_searches", JSON.stringify(next));
      return next;
    });
  };

  // Fetch portfolios
  useEffect(() => {
    api.collection
      .portfolios()
      .then((data) => {
        setPortfolios(data);
        if (data.length > 0) setActivePortfolioId(data[0].id);
      })
      .catch(() => {}); // user may not be logged in
  }, []);

  // Fetch portfolio details to compute set progress and collection map
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

  // Compute set progress map
  const setProgressMap = useMemo(() => {
    const progressMap: Record<string, { count: number; value: number }> = {};
    for (const item of portfolioItems) {
      const setCode = item.card.set?.code ?? item.card.setCode;
      if (!setCode) continue;
      if (!progressMap[setCode]) {
        progressMap[setCode] = { count: 0, value: 0 };
      }
      progressMap[setCode].count += 1;
      progressMap[setCode].value += (item.card.prices?.[0]?.value ?? 0) * item.quantity;
    }
    return progressMap;
  }, [portfolioItems]);

  // Load sets when TCG selected and "sets" tab active
  useEffect(() => {
    if (selectedTcg && activeTab === "sets" && !selectedSet) {
      setSetsLoading(true);
      api.cards
        .sets(selectedTcg)
        .then((data) => {
          // Sort sets: getcollectr images first, then ygoprodeck, then others (stable sort)
          const sorted = [...data].sort((a, b) => {
            const rank = (s: any) =>
              s.imageUrl?.includes("getcollectr")
                ? 0
                : s.imageUrl?.includes("ygoprodeck")
                  ? 1
                  : 2;
            return rank(a) - rank(b);
          });
          setSets(sorted);
        })
        .catch(() => setSets([]))
        .finally(() => setSetsLoading(false));
    }
  }, [selectedTcg, activeTab, selectedSet]);

  // Load cards based on search/tcg/set state
  useEffect(() => {
    let active = true;

    async function loadCards() {
      const shouldLoad =
        selectedSet ||
        (selectedTcg && activeTab === "cards") ||
        (!selectedTcg && search.trim()) ||
        (selectedTcg && search.trim()); // also load if search query is active on selected TCG

      if (!shouldLoad) {
        setCards([]);
        return;
      }

      setCardsLoading(true);
      setError(null);
      try {
        let data: CardType[] = [];
        if (selectedSet) {
          // Fetch cards in set
          data = await api.cards.list(undefined, selectedTcg ?? undefined, selectedSet.id);
        } else {
          // Fetch cards by search query and/or selected TCG
          data = await api.cards.list(search || undefined, selectedTcg || undefined);
        }
        if (active) {
          setCards(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Erro ao buscar cartas");
          setCards([]);
        }
      } finally {
        if (active) {
          setCardsLoading(false);
        }
      }
    }

    loadCards();
    return () => {
      active = false;
    };
  }, [search, selectedTcg, selectedSet, activeTab]);

  function handleSearch() {
    setSearch(searchInput);
    if (searchInput.trim()) {
      saveRecentSearch(searchInput);
      setSelectedSet(null);
    }
  }

  function handleClear() {
    setSearchInput("");
    setSearch("");
    setSelectedSet(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  const sortedCards = useMemo(() => {
    let result = cards;

    // If viewing a selectedSet, let the user search/filter cards inside this set locally
    if (selectedSet && searchInput.trim()) {
      const term = searchInput.toLowerCase();
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
        default:
          return 0;
      }
    });
  }, [cards, sortBy, selectedSet, searchInput]);

  const activeTcgName = useMemo(() => {
    return TCG_CATALOG.find((t) => t.slug === selectedTcg)?.name ?? selectedTcg;
  }, [selectedTcg]);

  const showTcgPicker = !selectedTcg && !search.trim();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Search Input Section */}
      <section className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 space-y-3">
        <h2 className="text-sm font-bold text-foreground">Buscar no Catálogo</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="search-products"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar cartas, coleções ou expansões..."
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>Buscar</Button>
          <Button variant="secondary" onClick={handleClear}>
            Limpar
          </Button>
        </div>
      </section>

      {/* Main Content Area */}
      {showTcgPicker ? (
        <div className="space-y-6">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="size-3.5" /> Buscas recentes
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchInput(term);
                      setSearch(term);
                      saveRecentSearch(term);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TCG Selection Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Escolha um jogo
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {TCG_CATALOG.map((item) => {
                if (!item.supported) {
                  return (
                    <div
                      key={item.categoryId}
                      className="group relative aspect-[1.5] w-full rounded-2xl border border-border overflow-hidden bg-card opacity-50 select-none"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover grayscale"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-4">
                        <span className="text-sm font-bold text-white leading-tight">
                          {item.name}
                        </span>
                        <span className="absolute bottom-4 right-4 bg-muted border border-border px-2 py-0.5 rounded text-[9px] font-bold text-muted-foreground uppercase">
                          Em breve
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.categoryId}
                    onClick={() => {
                      setSelectedTcg(item.slug);
                      setActiveTab("sets");
                      setSelectedSet(null);
                      setSearchInput("");
                      setSearch("");
                    }}
                    className="group relative aspect-[1.5] w-full rounded-2xl border border-border hover:border-slate-400 dark:hover:border-slate-700 overflow-hidden bg-card hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end items-start p-4 text-left">
                      <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {item.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        // Selected TCG or Search Mode
        <div className="space-y-5">
          {/* Header Controls / Breadcrumbs & Tab Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                <button
                  onClick={() => {
                    setSelectedTcg(null);
                    setSelectedSet(null);
                    setSearchInput("");
                    setSearch("");
                  }}
                  className="hover:text-foreground transition-colors"
                >
                  Jogos
                </button>
                {selectedTcg && (
                  <>
                    <ChevronRight className="size-3.5" />
                    <button
                      onClick={() => {
                        setSelectedSet(null);
                      }}
                      className={`hover:text-foreground transition-colors ${!selectedSet ? "text-foreground font-bold" : ""}`}
                    >
                      {activeTcgName}
                    </button>
                  </>
                )}
                {selectedSet && (
                  <>
                    <ChevronRight className="size-3.5" />
                    <span className="text-foreground font-bold truncate max-w-[200px]">
                      {selectedSet.name}
                    </span>
                  </>
                )}
              </div>

              {selectedTcg && !selectedSet && !search.trim() && (
                <>
                  <Separator orientation="vertical" className="h-5 hidden sm:block" />
                  {/* Segmented Control */}
                  <div className="flex bg-muted p-0.5 rounded-lg border border-border">
                    <button
                      onClick={() => {
                        setActiveTab("sets");
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        activeTab === "sets"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Layers className="size-3.5" />
                      Coleções
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("cards");
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        activeTab === "cards"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <IconLayoutGrid className="size-3.5" />
                      Cartas
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Right side options: Portfolio selector, view style & sorting */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Portfolio Select */}
              {portfolios.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <IconFolder className="size-3.5 text-muted-foreground shrink-0" />
                  <Select
                    value={activePortfolioId}
                    onValueChange={setActivePortfolioId}
                  >
                    <SelectTrigger className="h-8 border-border bg-muted text-foreground text-xs min-w-[130px] max-w-[180px]">
                      <SelectValue placeholder="Portfólio" />
                    </SelectTrigger>
                    <SelectContent>
                      {portfolios.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.name}
                          {p._count != null ? ` (${p._count.items})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Sorting option (only visible when listing cards) */}
              {(selectedSet || activeTab === "cards" || search.trim()) && (
                <div className="flex items-center gap-1.5">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-8 border-border bg-muted text-foreground text-xs min-w-[150px]">
                      <ArrowUpDown className="size-3.5 text-muted-foreground" />{" "}
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="best-match">Melhor Resultado</SelectItem>
                      <SelectItem value="price-asc">Preço: Menor → Maior</SelectItem>
                      <SelectItem value="price-desc">Preço: Maior → Menor</SelectItem>
                      <SelectItem value="name-asc">Nome: A → Z</SelectItem>
                      <SelectItem value="name-desc">Nome: Z → A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator orientation="vertical" className="h-6 hidden md:block" />

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

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Active Tab rendering */}
          {selectedTcg && activeTab === "sets" && !selectedSet && !search.trim() ? (
            // LIST OF EXPANSIONS/SETS
            setsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card h-48 animate-pulse p-4 space-y-3">
                    <Skeleton className="w-full h-24 rounded-lg" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : sets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Layers className="size-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Nenhuma coleção encontrada
                </h3>
                <p className="text-sm text-muted-foreground">
                  Nenhum set disponível para este jogo no momento.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {sets.length} coleções encontradas
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {sets.map((set) => (
                    <SetCard
                      key={set.id}
                      set={set}
                      progress={setProgressMap[set.code]}
                      onClick={() => {
                        setSelectedSet(set);
                        setSearchInput(""); // reset search input when selecting a set
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          ) : (
            // LIST OF CARDS (Grid / List / Set cards)
            <div className="space-y-5">
              {/* Set Banner details */}
              {selectedSet && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-border bg-card/30 backdrop-blur-sm gap-4">
                  <div className="flex items-center gap-4">
                    {getSetImageUrl(selectedSet) ? (
                      <div className="size-16 rounded-lg bg-muted flex items-center justify-center p-2 border border-border overflow-hidden shrink-0">
                        <img
                          src={getSetImageUrl(selectedSet)!}
                          alt={selectedSet.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="size-16 rounded-lg bg-muted flex items-center justify-center border border-border shrink-0">
                        <Layers className="size-8 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-bold text-foreground leading-snug">
                        {selectedSet.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border font-bold">
                          {selectedSet.code}
                        </span>
                        <span>{cards.length} cartas catalogadas</span>
                        {selectedSet.releaseDate && (
                          <span>
                            {new Date(selectedSet.releaseDate).toLocaleDateString("pt-BR", {
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* Set progress bar */}
                    {(() => {
                      const total = selectedSet.totalCards ?? selectedSet._count?.cards ?? 0;
                      const collected = setProgressMap[selectedSet.code]?.count ?? 0;
                      const pct = total > 0 ? Math.min(collected / total, 1) : 0;
                      if (total === 0) return null;
                      return (
                        <div className="flex flex-col gap-1 w-full sm:w-40">
                          <div className="flex justify-between text-[10px] font-bold text-muted-foreground font-mono">
                            <span>Colecionado</span>
                            <span>{collected}/{total}</span>
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

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSet(null)}
                      className="text-xs h-8 cursor-pointer"
                    >
                      <X className="size-3.5 mr-1" />
                      Fechar Set
                    </Button>
                  </div>
                </div>
              )}

              {/* Cards Results */}
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {cardsLoading ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="size-3.5 animate-spin" /> Carregando cartas...
                    </span>
                  ) : (
                    `${sortedCards.length} resultados encontrados`
                  )}
                </p>

                {cardsLoading && sortedCards.length === 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <GridCardSkeleton key={`skeleton-${i}`} />
                    ))}
                  </div>
                ) : sortedCards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Search className="size-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Nenhuma carta encontrada
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {search
                        ? `Nenhum resultado para "${search}". Tente outro termo.`
                        : "Esta coleção está vazia ou não possui cartas sincronizadas."}
                    </p>
                  </div>
                ) : viewType === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {sortedCards.map((card) => (
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
                    {sortedCards.map((card) => (
                      <ListRow
                        key={card.id}
                        card={card}
                        activePortfolioId={activePortfolioId}
                        onAdd={refreshPortfolio}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <ProUpgradeModal
        open={proModalOpen}
        onClose={() => setProModalOpen(false)}
      />
    </main>
  );
}
