"use client";

import { PortfolioSelector } from "@/app/components/PortfolioSelector";
import { ProUpgradeModal } from "@/app/components/ProUpgradeModal";
import { TcgCard } from "@/app/components/TcgCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { api, type Card as CardType, type Portfolio } from "@/lib/api";

import {
  IconLayoutGrid,
  IconListDetails,
  IconLoader2,
  IconPlus,
} from "@tabler/icons-react";
import { ArrowUpDown, Clock, Loader2, Search, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { sileo } from "sileo";

type CollectionMap = Record<string, number>;

function FilterSection({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
          {title}
        </h3>
        {badge && (
          <Badge variant="default" className="text-[9px] h-4 px-1.5">
            {badge}
          </Badge>
        )}
      </div>
      {children}
    </div>
  );
}

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

function ExplorePageContent() {
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useQueryState("sort", {
    defaultValue: "best-match",
  });
  const [search, setSearch] = useQueryState("q", { defaultValue: "" });
  const [searchInput, setSearchInput] = useState("");
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolioId, setActivePortfolioId] = useState("");
  const [collectionMap, setCollectionMap] = useState<CollectionMap>({});
  const [proModalOpen, setProModalOpen] = useState(false);

  // States from filter sidebar & searches
  const [selectedTcg, setSelectedTcg] = useQueryState("tcg");
  const activeTcgs = useMemo(() => {
    return selectedTcg ? selectedTcg.split(",") : [];
  }, [selectedTcg]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [cards, setCards] = useState<CardType[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Synchronize searchInput when query parameter 'q' changes (e.g. initial load, recent chip click)
  useEffect(() => {
    setSearchInput(search || "");
  }, [search]);

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
      const next = [cleanTerm, ...prev.filter((x) => x !== cleanTerm)].slice(
        0,
        5,
      );
      localStorage.setItem("recent_searches", JSON.stringify(next));
      return next;
    });
  };

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
      .catch(() => {}); // user may not be logged in
  }, []);

  // Fetch portfolios
  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // Fetch portfolio details to compute collection map
  const refreshPortfolio = useCallback(() => {
    if (!activePortfolioId) {
      setCollectionMap({});
      return;
    }
    api.collection
      .getPortfolio(activePortfolioId)
      .then((data) => {
        const map: CollectionMap = {};
        for (const item of data.items) {
          map[item.cardId] = (map[item.cardId] ?? 0) + item.quantity;
        }
        setCollectionMap(map);
      })
      .catch(() => {
        setCollectionMap({});
      });
  }, [activePortfolioId]);

  useEffect(() => {
    refreshPortfolio();
  }, [refreshPortfolio]);

  // Load cards based on search query & selected TCG category
  useEffect(() => {
    let active = true;

    async function loadCards() {
      setCardsLoading(true);
      setError(null);
      try {
        const data = await api.cards.list(
          search || undefined,
          selectedTcg || undefined,
        );
        if (active) {
          setCards(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Erro ao buscar cartas",
          );
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
  }, [search, selectedTcg]);

  function handleSearch() {
    setSearch(searchInput);
    if (searchInput.trim()) {
      saveRecentSearch(searchInput);
    }
  }

  function handleClear() {
    setSearchInput("");
    setSearch("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
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
  }, [cards, sortBy]);

  // Helper to handle TCG sidebar filter toggle
  const handleTcgToggle = (slug: string) => {
    setSelectedTcg((prev) => {
      const current = prev ? prev.split(",") : [];
      const next = current.includes(slug)
        ? current.filter((x) => x !== slug)
        : [...current, slug];
      return next.length > 0 ? next.join(",") : null;
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Search Input Section */}
      <section className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 space-y-3">
        <h2 className="text-sm font-bold text-foreground">
          Buscar no Catálogo
        </h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="search-products"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar cartas por nome, expansão, código ou raridade..."
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>Buscar</Button>
          <Button variant="secondary" onClick={handleClear}>
            Limpar
          </Button>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Clock className="size-3" /> Recentes:
            </span>
            {recentSearches.map((term) => (
              <button
                key={term}
                onClick={() => {
                  setSearchInput(term);
                  setSearch(term);
                  saveRecentSearch(term);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-muted/30 text-[11px] font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Toolbar: Portfolio, ResultsCount, Sorting & Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-2">
          {portfolios.length > 0 && (
            <PortfolioSelector
              portfolios={portfolios}
              activePortfolioId={activePortfolioId}
              onSelect={setActivePortfolioId}
              onRefresh={fetchPortfolios}
              labelPrefix="Adicionando a:"
            />
          )}

          <Separator
            orientation="vertical"
            className="h-5 hidden sm:block mx-1"
          />

          <p className="text-xs text-muted-foreground">
            {cardsLoading ? (
              <span className="flex items-center gap-1">
                <Loader2 className="size-3 animate-spin" /> Buscando...
              </span>
            ) : (
              `${sortedCards.length} resultados encontrados`
            )}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-8 border-border bg-muted text-foreground text-xs min-w-[160px]">
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

      {/* Main Layout: Sidebar Filters + Cards List */}
      <div className="flex gap-6">
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-20 rounded-xl border border-border bg-card/30 backdrop-blur-sm p-4 space-y-5 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <FilterSection title="Tipo de Produto">
              <p className="text-xs text-muted-foreground -mt-1">
                Filtrar por tipo de produto.
              </p>
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <Checkbox id="cards-only" checked />
                  <label
                    htmlFor="cards-only"
                    className="text-xs text-foreground font-medium"
                  >
                    Apenas Cartas
                  </label>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <Checkbox id="sealed-only" disabled />
                  <label
                    htmlFor="sealed-only"
                    className="text-xs text-muted-foreground"
                  >
                    Apenas Selados
                  </label>
                </div>
              </div>
            </FilterSection>

            <Separator />

            <FilterSection title="Faixa de Preço" badge="PRO">
              <p className="text-xs text-muted-foreground -mt-1">
                Filtrar por faixa de preço.
              </p>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setProModalOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setProModalOpen(true);
                  }
                }}
                className="flex items-center gap-2 w-full pt-1 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
              >
                <Input
                  placeholder="Min."
                  readOnly
                  className="h-8 bg-muted/40 border-border text-foreground text-xs pointer-events-none"
                />
                <span className="text-xs text-muted-foreground">a</span>
                <Input
                  placeholder="Max."
                  readOnly
                  className="h-8 bg-muted/40 border-border text-foreground text-xs pointer-events-none"
                />
              </div>
            </FilterSection>

            <Separator />

            <FilterSection title="Idioma" badge="PRO">
              <p className="text-xs text-muted-foreground -mt-1">
                Filtrar por idioma.
              </p>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setProModalOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setProModalOpen(true);
                  }
                }}
                className="space-y-2 pt-2 text-left block w-full cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
              >
                {[
                  { code: "en", name: "Inglês" },
                  { code: "ja", name: "Japonês" },
                  { code: "zh", name: "Chinês" },
                ].map((lang) => (
                  <div key={lang.code} className="flex items-center gap-2">
                    <Checkbox id={`lang-${lang.code}`} disabled />
                    <span className="text-xs text-muted-foreground font-medium">
                      {lang.name}
                    </span>
                  </div>
                ))}
              </div>
            </FilterSection>

            <Separator />

            <FilterSection title="Jogo / Categoria">
              <p className="text-xs text-muted-foreground -mt-1">
                Filtrar por jogo.
              </p>
              <div className="space-y-2.5 pt-2">
                {/* Supported TCGs */}
                {[
                  { slug: "pokemon", name: "Pokémon" },
                  { slug: "magic", name: "Magic: The Gathering" },
                  { slug: "yugioh", name: "Yu-Gi-Oh!" },
                  { slug: "onepiece", name: "One Piece" },
                ].map((tcg) => (
                  <div key={tcg.slug} className="flex items-center gap-2">
                    <Checkbox
                      id={`tcg-${tcg.slug}`}
                      checked={activeTcgs.includes(tcg.slug)}
                      onCheckedChange={() => handleTcgToggle(tcg.slug)}
                    />
                    <label
                      htmlFor={`tcg-${tcg.slug}`}
                      className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none font-medium"
                    >
                      {tcg.name}
                    </label>
                  </div>
                ))}

                {/* Coming Soon TCGs */}
                {[
                  { name: "Lorcana" },
                  { name: "Flesh and Blood" },
                  { name: "Dragon Ball Super" },
                  { name: "Digimon" },
                  { name: "Star Wars Unlimited" },
                  { name: "Weiß Schwarz" },
                  { name: "Union Arena" },
                ].map((tcg) => (
                  <div
                    key={tcg.name}
                    className="flex items-center justify-between gap-2 opacity-50 select-none"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`tcg-coming-${tcg.name.toLowerCase().replace(/\s+/g, "")}`}
                        disabled
                      />
                      <span className="text-xs text-muted-foreground font-medium">
                        {tcg.name}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[8px] h-3.5 px-1 uppercase tracking-wider font-mono opacity-80 leading-none"
                    >
                      Breve
                    </Badge>
                  </div>
                ))}
              </div>
            </FilterSection>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 mb-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {cardsLoading && cards.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
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
                  : "O catálogo está vazio. Adicione cartas via banco de dados."}
              </p>
            </div>
          ) : viewType === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
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

      <ProUpgradeModal
        open={proModalOpen}
        onClose={() => setProModalOpen(false)}
      />
    </main>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="animate-spin text-primary size-8" />
        </div>
      }
    >
      <ExplorePageContent />
    </Suspense>
  );
}
