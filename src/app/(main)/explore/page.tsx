"use client";

import {
  IconLayoutGrid,
  IconListDetails,
  IconLoader2,
  IconPlus,
} from "@tabler/icons-react";
import {
  ArrowUpDown,
  Calendar,
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
import { useQueryState } from "nuqs";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { sileo } from "sileo";
import {
  FilterSection,
  LanguageFilter,
  PriceRangeFilter,
  ProductTypeFilter,
  type ProductTypeValue,
} from "@/app/components/filters";
import { PortfolioSelector } from "@/app/components/PortfolioSelector";
import { ProUpgradeModal } from "@/app/components/ProUpgradeModal";
import { getSetImageUrl, type SetProgress } from "@/app/components/SetCard";
import { TcgCard } from "@/app/components/TcgCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { GlassPill, SectionLabel } from "@/components/ui/glass";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  api,
  type CardSet,
  type Card as CardType,
  type Portfolio,
} from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import {
  useCardSets,
  useCards,
  useCollectionStats,
  useInvalidateCollection,
  usePortfolioDetail,
  usePortfolios,
} from "@/lib/queries";

type CollectionMap = Record<string, number>;
type SetProgressMap = Record<string, SetProgress>;

// Mesmo catálogo suportado do mobile (mint-foil-app/lib/tcg-catalog.ts);
// `chip` é o nome curto usado nos chips de telas pequenas
const SUPPORTED_TCGS = [
  { slug: "pokemon", name: "Pokémon", chip: "Pokémon" },
  { slug: "magic", name: "Magic: The Gathering", chip: "Magic" },
  { slug: "yugioh", name: "Yu-Gi-Oh!", chip: "Yu-Gi-Oh!" },
  { slug: "onepiece", name: "One Piece", chip: "One Piece" },
];

const COMING_SOON_TCGS = [
  "Lorcana",
  "Flesh and Blood",
  "Dragon Ball Super",
  "Digimon",
  "Star Wars Unlimited",
  "Weiß Schwarz",
  "Union Arena",
];

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getLatestPrice(card: CardType) {
  return card.prices[0]?.value ?? 0;
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
    <Card className="w-full h-full overflow-hidden bg-card py-0">
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

/** Item compacto do carrossel de coleções (espelho do carrossel do explore mobile). */
function CarouselSetItem({
  set,
  progress,
  selected,
  onClick,
}: {
  set: CardSet;
  progress: SetProgress | null;
  selected: boolean;
  onClick: () => void;
}) {
  const imgUrl = getSetImageUrl(set);
  const [imgFailed, setImgFailed] = useState(false);
  const total = set.totalCards ?? set._count?.cards ?? 0;
  const collected = progress?.count ?? 0;
  const pct = total > 0 ? Math.min(collected / total, 1) : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`glass-card w-28 shrink-0 cursor-pointer overflow-hidden !rounded-[14px] text-left transition-all hover:-translate-y-0.5 ${
        selected ? "ring-2 ring-primary" : ""
      }`}
    >
      <div className="relative flex h-16 w-full items-center justify-center p-2">
        {imgUrl && !imgFailed ? (
          <Image
            src={imgUrl}
            alt={set.name}
            fill
            sizes="112px"
            className="object-contain p-1.5"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <Layers className="size-6 stroke-[1.5] text-muted-foreground" />
        )}
      </div>
      <div className="space-y-1 px-2 pb-2">
        <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-foreground">
          {set.name}
        </p>
        {total > 0 && collected > 0 ? (
          <div className="flex items-center gap-1.5">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${pct * 100}%` }}
              />
            </div>
            <span className="text-[9px] font-bold tabular-nums text-muted-foreground">
              {collected}/{total}
            </span>
          </div>
        ) : total > 0 ? (
          <p className="text-[10px] text-muted-foreground">{total} cartas</p>
        ) : null}
      </div>
    </button>
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
  const displayPrice = tcgPrice;
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
      <div className="glass-card flex items-center gap-4 !rounded-2xl px-4 py-3 transition-all hover:bg-muted/30 group">
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
            <TrendingUp className="size-3 text-emerald-500" />
            <span className="text-sm font-bold text-foreground font-mono">
              R$ {formatPrice(displayPrice)}
            </span>
          </div>
          {tcgPrice > 0 && (
            <span className="text-[9px] text-muted-foreground">
              internacional
            </span>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="shrink-0 size-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10"
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
  const [searchFocused, setSearchFocused] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolioId, setActivePortfolioId] = useState("");

  // Jogos ativos: multi-select estilo marketplace (funcionalidade própria do
  // web — o mobile usa escolha única). "Todos" = lista vazia.
  const [selectedTcg, setSelectedTcg] = useQueryState("tcg");
  const activeTcgs = useMemo(
    () => (selectedTcg ? selectedTcg.split(",") : []),
    [selectedTcg],
  );
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [selectedSet, setSelectedSet] = useState<CardSet | null>(null);

  // Filtros PRO (client-side sobre o resultado carregado)
  const [proModalOpen, setProModalOpen] = useState(false);
  // null = faixa intocada (sem filtro); o teto acompanha o resultado carregado
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [proLanguages, setProLanguages] = useState<string[]>([]);
  // Tipo de produto: cartas (padrão), selados ou ambos — filtra no backend
  const [productType, setProductType] = useState<ProductTypeValue>("single");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // PRO: sessão primeiro, stats como fallback (mesma regra do settings)
  const { data: session } = useSession();
  const sessionUser = session?.user as { isPro?: boolean } | undefined;
  const statsQuery = useCollectionStats(!!session?.user);
  const isPro =
    (sessionUser?.isPro ?? false) || (statsQuery.data?.isPro ?? false);

  // Carrossel segue um jogo só quando exatamente um está filtrado
  const carouselTcg = activeTcgs.length === 1 ? activeTcgs[0] : undefined;

  // Dados via TanStack Query (lib/queries.ts): cache compartilhado entre
  // páginas e revalidação automática após mutações (useInvalidateCollection)
  const portfoliosQuery = usePortfolios();
  const portfolioDetail = usePortfolioDetail(activePortfolioId || undefined);
  const setsQuery = useCardSets(carouselTcg);
  const cardsQuery = useCards(
    search.trim() || undefined,
    activeTcgs.length > 0 ? activeTcgs.join(",") : undefined,
    selectedSet?.id,
    productType,
  );
  const invalidateCollection = useInvalidateCollection();

  const sets = setsQuery.data ?? [];
  const setsLoading = setsQuery.isPending;
  const cards = cardsQuery.data ?? [];
  const cardsLoading = cardsQuery.isPending;
  const error = cardsQuery.error
    ? (cardsQuery.error.message ?? "Erro ao buscar cartas")
    : null;

  const activeTcgLabel = SUPPORTED_TCGS.find(
    (t) => t.slug === carouselTcg,
  )?.chip;
  const searching = !!search.trim();

  // Sincroniza o input quando 'q' muda por fora (load inicial, chip de recente)
  useEffect(() => {
    setSearchInput(search || "");
  }, [search]);

  // Busca ao digitar, com debounce — mesmo comportamento do explore mobile
  function handleChangeQuery(value: string) {
    setSearchInput(value);
    if (value) setSelectedSet(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      if (value.trim()) saveRecentSearch(value);
    }, 300);
  }

  useEffect(() => {
    const stored = localStorage.getItem("recent_searches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {}
    }
  }, []);

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

  // Ordena favoritos primeiro e escolhe o ativo quando a lista chega —
  // localStorage só no efeito (client), nunca durante o render
  useEffect(() => {
    const data = portfoliosQuery.data;
    if (!data) return;

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
      const hasOldStored = sortedPortfolios.some((p) => p.id === oldDefault);

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
  }, [portfoliosQuery.data]);

  // Detalhe do portfólio → mapa de quantidades por carta e progresso por set
  const { collectionMap, setProgress } = useMemo(() => {
    const map: CollectionMap = {};
    const progress: SetProgressMap = {};
    for (const item of portfolioDetail.data?.items ?? []) {
      map[item.cardId] = (map[item.cardId] ?? 0) + item.quantity;
      const code = item.card.set?.code ?? item.card.setCode;
      if (!progress[code]) progress[code] = { count: 0, value: 0 };
      progress[code].count += 1; // cartas únicas, não cópias
      progress[code].value +=
        (item.card.prices?.[0]?.value ?? 0) * item.quantity;
    }
    return { collectionMap: map, setProgress: progress };
  }, [portfolioDetail.data]);

  function handleClear() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchInput("");
    setSearch("");
  }

  // Filtro de jogo estilo marketplace: toggle de cada jogo na lista.
  // Refinar filtro NÃO limpa a busca (comportamento de marketplace); só o
  // set selecionado cai, porque set pertence a um jogo.
  function toggleTcg(slug: string) {
    setSelectedTcg((prev) => {
      const current = prev ? prev.split(",") : [];
      const next = current.includes(slug)
        ? current.filter((x) => x !== slug)
        : [...current, slug];
      return next.length > 0 ? next.join(",") : null;
    });
    setSelectedSet(null);
  }

  function clearTcgs() {
    setSelectedTcg(null);
    setSelectedSet(null);
  }

  // Carrossel: clicar no set selecionado de novo desmarca (toggle)
  function handleSelectSet(set: CardSet) {
    if (selectedSet?.id === set.id) {
      setSelectedSet(null);
      return;
    }
    handleClear();
    setSelectedSet(set);
  }

  function applyRecentSearch(term: string) {
    setSelectedSet(null);
    setSearchInput(term);
    setSearch(term);
    saveRecentSearch(term);
  }

  // Filtros PRO aplicados client-side sobre o resultado carregado
  const filteredCards = useMemo(() => {
    if (!isPro) return cards;
    let list = cards;
    if (priceRange) {
      const [min, max] = priceRange;
      list = list.filter((c) => {
        const p = getLatestPrice(c);
        return p >= min && p <= max;
      });
    }
    if (proLanguages.length > 0)
      list = list.filter((c) => proLanguages.includes(c.language));
    return list;
  }, [cards, isPro, priceRange, proLanguages]);

  // Teto do slider: maior preço do resultado, arredondado pra cima
  const priceCeil = useMemo(() => {
    const top = cards.reduce((m, c) => Math.max(m, getLatestPrice(c)), 0);
    return Math.max(10, Math.ceil(top / 10) * 10);
  }, [cards]);

  const sortedCards = useMemo(() => {
    return [...filteredCards].sort((a, b) => {
      const priceA = getLatestPrice(a);
      const priceB = getLatestPrice(b);
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
  }, [filteredCards, sortBy]);

  // Sets com imagem primeiro (getcollectr > ygoprodeck), preservando a ordem
  // de lançamento do backend dentro de cada grupo (sort estável) — como no mobile
  const sortedSets = useMemo(() => {
    const rank = (s: CardSet) =>
      s.imageUrl?.includes("getcollectr")
        ? 0
        : s.imageUrl?.includes("ygoprodeck")
          ? 1
          : 2;
    return [...sets].sort((a, b) => rank(a) - rank(b));
  }, [sets]);

  const contentLabel = selectedSet
    ? `${selectedSet.name} — ${sortedCards.length} carta${sortedCards.length !== 1 ? "s" : ""}`
    : searching
      ? `${sortedCards.length} resultado${sortedCards.length !== 1 ? "s" : ""}`
      : activeTcgs.length === 1
        ? `Em Alta · ${activeTcgLabel}`
        : "Em Alta";

  const sortActive = sortBy !== "best-match";
  const selectedSetTotal =
    selectedSet?.totalCards ?? selectedSet?._count?.cards ?? 0;
  const selectedSetProg = selectedSet
    ? (setProgress[selectedSet.code] ?? null)
    : null;
  const selectedSetRelDate = selectedSet?.releaseDate
    ? new Date(selectedSet.releaseDate).toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      })
    : null;
  const selectedSetImg = selectedSet ? getSetImageUrl(selectedSet) : null;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* ── Busca: pill de vidro, busca ao digitar ── */}
      <div className="relative max-w-2xl">
        <div className="glass-pill flex h-11 items-center gap-2.5 px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={(e) => handleChangeQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Buscar cartas..."
            className="h-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {searchInput.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Histórico de busca — só enquanto o input está focado e vazio,
            como no mobile (histórico mora no gesto de buscar) */}
        {searchFocused && !searchInput.trim() && recentSearches.length > 0 && (
          <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-lg">
            {recentSearches.map((term) => (
              <button
                key={term}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyRecentSearch(term)}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-muted/40"
              >
                <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{term}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Chips de jogo — só em telas pequenas; no desktop o filtro mora
          na sidebar de marketplace ── */}
      <ScrollArea className="lg:hidden">
        <div className="flex gap-2 pb-2">
          <GlassPill active={activeTcgs.length === 0} onClick={clearTcgs}>
            Todos
          </GlassPill>
          {SUPPORTED_TCGS.map((t) => (
            <GlassPill
              key={t.slug}
              active={activeTcgs.includes(t.slug)}
              onClick={() => toggleTcg(t.slug)}
            >
              {t.chip}
            </GlassPill>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* ── Marketplace: sidebar de filtros aparente + conteúdo ── */}
      {/* Sem items-start: o aside precisa esticar na altura da linha para o
          sticky interno ter percurso e acompanhar o scroll */}
      <div className="flex gap-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="glass-card sticky top-20 max-h-[calc(100vh-6rem)] space-y-5 overflow-y-auto p-4">
            <ProductTypeFilter value={productType} onChange={setProductType} />

            <PriceRangeFilter
              isPro={isPro}
              value={priceRange}
              ceil={priceCeil}
              onChange={setPriceRange}
              onUpsell={() => setProModalOpen(true)}
            />

            <LanguageFilter
              isPro={isPro}
              value={proLanguages}
              onChange={setProLanguages}
              onUpsell={() => setProModalOpen(true)}
            />

            <FilterSection title="Jogo / Categoria">
              <div className="space-y-2.5 pt-2">
                {SUPPORTED_TCGS.map((tcg) => (
                  <div key={tcg.slug} className="flex items-center gap-2">
                    <Checkbox
                      id={`tcg-${tcg.slug}`}
                      checked={activeTcgs.includes(tcg.slug)}
                      onCheckedChange={() => toggleTcg(tcg.slug)}
                    />
                    <label
                      htmlFor={`tcg-${tcg.slug}`}
                      className="cursor-pointer select-none text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {tcg.name}
                    </label>
                  </div>
                ))}

                {COMING_SOON_TCGS.map((name) => (
                  <div
                    key={name}
                    className="flex select-none items-center justify-between gap-2 opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`tcg-coming-${name.toLowerCase().replace(/\s+/g, "")}`}
                        disabled
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        {name}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="h-3.5 px-1 font-mono text-[8px] uppercase leading-none tracking-wider opacity-80"
                    >
                      Breve
                    </Badge>
                  </div>
                ))}
              </div>
            </FilterSection>
          </div>
        </aside>

        {/* ── Coluna de conteúdo ── */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* ── Carrossel de coleções — clica para filtrar o grid (some na busca) ── */}
          {!searching && (
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <SectionLabel>
                  {carouselTcg
                    ? `Coleções · ${activeTcgLabel}`
                    : "Coleções recentes"}
                </SectionLabel>
                <Link
                  href="/sets"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Ver todas →
                </Link>
              </div>
              {setsLoading && sortedSets.length === 0 ? (
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-[120px] w-28 rounded-[14px]"
                    />
                  ))}
                </div>
              ) : (
                // ScrollArea em vez de overflow-x-auto: no Windows a scrollbar
                // nativa é permanente e feia; a do Radix é overlay e discreta
                <ScrollArea>
                  <div className="flex gap-2 pb-2.5">
                    {sortedSets.slice(0, 24).map((set) => (
                      <CarouselSetItem
                        key={set.id}
                        set={set}
                        progress={setProgress[set.code] ?? null}
                        selected={selectedSet?.id === set.id}
                        onClick={() => handleSelectSet(set)}
                      />
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}
            </section>
          )}

          {/* ── Adicionando em (esquerda) + ordenação e visualização (direita) ── */}
          <div className="flex flex-wrap items-center gap-2">
            {portfolios.length > 0 && (
              <PortfolioSelector
                portfolios={portfolios}
                activePortfolioId={activePortfolioId}
                onSelect={setActivePortfolioId}
                onRefresh={invalidateCollection}
                labelPrefix="Adicionando em"
              />
            )}

            <div className="ml-auto flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger
                  size="sm"
                  className={`cursor-pointer rounded-full border text-xs font-bold shadow-none ${
                    sortActive
                      ? "border-primary/25 bg-primary/10 text-primary"
                      : "glass-pill text-foreground"
                  }`}
                >
                  <ArrowUpDown
                    className={`size-3.5 ${sortActive ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="best-match">Melhor Resultado</SelectItem>
                  <SelectItem value="price-asc">
                    Preço: Menor → Maior
                  </SelectItem>
                  <SelectItem value="price-desc">
                    Preço: Maior → Menor
                  </SelectItem>
                  <SelectItem value="name-asc">Nome: A → Z</SelectItem>
                  <SelectItem value="name-desc">Nome: Z → A</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <GlassPill
                  active={viewType === "grid"}
                  onClick={() => setViewType("grid")}
                  className="px-2.5 py-1.5"
                  aria-label="Visualizar em grade"
                >
                  <IconLayoutGrid className="size-4" />
                </GlassPill>
                <GlassPill
                  active={viewType === "list"}
                  onClick={() => setViewType("list")}
                  className="px-2.5 py-1.5"
                  aria-label="Visualizar em lista"
                >
                  <IconListDetails className="size-4" />
                </GlassPill>
              </div>
            </div>
          </div>

          {/* ── Label da seção + limpar set selecionado ── */}
          <div className="flex items-center justify-between gap-2">
            <SectionLabel className="min-w-0 truncate">
              {contentLabel}
            </SectionLabel>
            {selectedSet && (
              <button
                type="button"
                onClick={() => setSelectedSet(null)}
                className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/15"
              >
                Limpar
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* ── Banner do set selecionado ── */}
          {selectedSet && (
            <div className="glass-card flex items-stretch gap-3 !rounded-2xl p-2">
              {selectedSetImg && (
                <div className="relative h-[70px] w-[110px] shrink-0">
                  <Image
                    src={selectedSetImg}
                    alt={selectedSet.name}
                    fill
                    sizes="110px"
                    className="object-contain"
                  />
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-1 pr-2">
                <p className="line-clamp-2 text-[13px] font-bold leading-snug text-foreground">
                  {selectedSet.name}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                  {selectedSet.tcg?.name && <span>{selectedSet.tcg.name}</span>}
                  {selectedSetRelDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="size-2.5" />
                      {selectedSetRelDate}
                    </span>
                  )}
                </div>
                {selectedSetTotal > 0 && (
                  <div className="mt-0.5 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.min((selectedSetProg?.count ?? 0) / selectedSetTotal, 1) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {selectedSetProg?.count ?? 0}/{selectedSetTotal}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Grid de cartas ── */}
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {cardsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                  : "O catálogo está vazio. Adicione cartas via banco de dados."}
              </p>
            </div>
          ) : viewType === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                  onAdd={invalidateCollection}
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
                  onAdd={invalidateCollection}
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
