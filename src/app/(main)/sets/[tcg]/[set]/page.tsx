"use client";

import { IconLayoutGrid, IconListDetails } from "@tabler/icons-react";
import {
  ArrowUpDown,
  Calendar,
  ChevronRight,
  Loader2,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { Suspense, useEffect, useMemo, useState } from "react";
import { AddToPortfolioButton } from "@/app/components/AddToPortfolioButton";
import {
  CheckboxFilterList,
  FilterSection,
  LanguageFilter,
  PriceRangeFilter,
  ProductTypeFilter,
  type ProductTypeValue,
} from "@/app/components/filters";
import { PortfolioSelector } from "@/app/components/PortfolioSelector";
import { ProUpgradeModal } from "@/app/components/ProUpgradeModal";
import { getSetImageUrl } from "@/app/components/SetCard";
import { TcgCard } from "@/app/components/TcgCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GlassPill, SectionLabel } from "@/components/ui/glass";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Card as CardType, Portfolio } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import {
  useCards,
  useCollectionStats,
  useInvalidateCollection,
  usePortfolioDetail,
  usePortfolios,
  useSetBySlug,
} from "@/lib/queries";

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

/** Skeleton 1:1 com o banner real do set — mesma altura, sem layout shift */
function SetBannerSkeleton() {
  return (
    <div className="glass-card flex flex-col gap-4 !rounded-2xl p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="h-[64px] w-[100px] shrink-0 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      <div className="w-full space-y-1.5 md:w-56">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
    </div>
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
  const displayPrice = tcgPrice;

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
          <p className="text-xs text-muted-foreground">
            {card.rarity} • {card.setCode} • Qtd. {quantity}
          </p>
        </div>

        <div className="text-right shrink-0 w-32">
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

        <AddToPortfolioButton
          cardId={card.id}
          defaultPortfolioId={activePortfolioId}
          onSuccess={onAdd}
          triggerClassName="shrink-0 size-8 rounded-full border border-emerald-500/50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
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
  const [search, setSearch] = useQueryState("q", {
    defaultValue: "",
    throttleMs: 300,
  });
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useQueryState("sort", { defaultValue: "number" });

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolioId, setActivePortfolioId] = useState("");
  const [setImgFailed, setSetImgFailed] = useState(false);

  // Filtros da sidebar (mesmo padrão marketplace do Explore)
  const [proModalOpen, setProModalOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [proLanguages, setProLanguages] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [productType, setProductType] = useState<ProductTypeValue>("single");

  // PRO: sessão primeiro, stats como fallback (mesma regra do settings)
  const { data: session } = useSession();
  const sessionUser = session?.user as { isPro?: boolean } | undefined;
  const statsQuery = useCollectionStats(!!session?.user);
  const isPro =
    (sessionUser?.isPro ?? false) || (statsQuery.data?.isPro ?? false);

  // Dados via TanStack Query — mesmo cache do Explore (['cards', ..., setId])
  const setQuery = useSetBySlug(tcgSlug, setSlug);
  const setInfo = setQuery.data ?? null;
  const cardsQuery = useCards(undefined, tcgSlug, setInfo?.id, productType);
  const cards = useMemo(
    () => (setInfo ? (cardsQuery.data ?? []) : []),
    [setInfo, cardsQuery.data],
  );
  const loading = setQuery.isPending || (!!setInfo && cardsQuery.isPending);

  const portfoliosQuery = usePortfolios();
  const portfolioDetail = usePortfolioDetail(activePortfolioId || undefined);
  const invalidateCollection = useInvalidateCollection();

  // Favoritos primeiro + escolha do ativo (mesma regra do Explore)
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

  // Quantidades por carta e progresso do set a partir do detalhe do portfólio
  const { collectionMap, setProgressMap } = useMemo(() => {
    const map: CollectionMap = {};
    const progressMap: Record<string, { count: number; value: number }> = {};
    for (const item of portfolioDetail.data?.items ?? []) {
      map[item.cardId] = (map[item.cardId] ?? 0) + item.quantity;
      const setCode = item.card.set?.code ?? item.card.setCode;
      if (!setCode) continue;
      if (!progressMap[setCode]) progressMap[setCode] = { count: 0, value: 0 };
      progressMap[setCode].count += 1;
      progressMap[setCode].value +=
        (item.card.prices?.[0]?.value ?? 0) * item.quantity;
    }
    return { collectionMap: map, setProgressMap: progressMap };
  }, [portfolioDetail.data]);

  // Raridades presentes no set, para o filtro da sidebar
  const rarityOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cards) {
      if (!c.rarity) continue;
      counts.set(c.rarity, (counts.get(c.rarity) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([rarity, count]) => ({ rarity, count }));
  }, [cards]);

  // Teto do slider de preço: maior preço do set, arredondado pra cima
  const priceCeil = useMemo(() => {
    const top = cards.reduce((m, c) => Math.max(m, getLatestPrice(c)), 0);
    return Math.max(10, Math.ceil(top / 10) * 10);
  }, [cards]);

  const filteredCards = useMemo(() => {
    let result = cards;
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.setCode.toLowerCase().includes(term) ||
          c.rarity?.toLowerCase().includes(term),
      );
    }

    if (selectedRarities.length > 0) {
      result = result.filter(
        (c) => c.rarity && selectedRarities.includes(c.rarity),
      );
    }

    // Filtros PRO client-side (mesma regra do Explore)
    if (isPro) {
      if (priceRange) {
        const [min, max] = priceRange;
        result = result.filter((c) => {
          const p = getLatestPrice(c);
          return p >= min && p <= max;
        });
      }
      if (proLanguages.length > 0) {
        result = result.filter((c) => proLanguages.includes(c.language));
      }
    }

    return [...result].sort((a, b) => {
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
        case "rarity":
          return b.rarity ? b.rarity.localeCompare(a.rarity ?? "") : 1;
        default:
          return a.setCode.localeCompare(b.setCode);
      }
    });
  }, [
    cards,
    search,
    sortBy,
    selectedRarities,
    isPro,
    priceRange,
    proLanguages,
  ]);

  const tcgName = setInfo?.tcg?.name ?? tcgSlug;
  const sortActive = sortBy !== "number";
  const relDate = setInfo?.releaseDate
    ? new Date(setInfo.releaseDate).toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      })
    : null;
  const total = setInfo?.totalCards ?? setInfo?._count?.cards ?? 0;
  const collected = setInfo ? (setProgressMap[setInfo.code]?.count ?? 0) : 0;
  const pct = total > 0 ? Math.min(collected / total, 1) : 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Breadcrumb (mesmo padrão da página da carta) */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/sets" className="hover:text-primary transition-colors">
          Sets
        </Link>
        <ChevronRight className="size-3" />
        <Link
          href={`/sets/${tcgSlug}`}
          className="hover:text-primary transition-colors"
        >
          {tcgName}
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground truncate max-w-50">
          {setInfo?.name ?? setSlug}
        </span>
      </nav>

      {/* Banner do set — mesmo padrão do banner de set do Explore */}
      {loading && !setInfo ? (
        <SetBannerSkeleton />
      ) : setInfo ? (
        <div className="glass-card flex flex-col gap-4 !rounded-2xl p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {(() => {
              const imgUrl = getSetImageUrl(setInfo);
              return imgUrl && !setImgFailed ? (
                <div className="relative h-[64px] w-[100px] shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={imgUrl}
                    alt={setInfo.name}
                    fill
                    sizes="150px"
                    className="object-contain"
                    onError={() => setSetImgFailed(true)}
                  />
                </div>
              ) : null;
            })()}
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {setInfo.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <Badge
                  variant="outline"
                  className="px-1.5 py-0 font-mono text-[10px] font-bold"
                >
                  {setInfo.code}
                </Badge>
                <span>{cards.length} cartas catalogadas</span>
                {relDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="size-2.5" />
                    {relDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {total > 0 && (
            <div className="flex w-full shrink-0 flex-col gap-1 border-t border-border/40 pt-2 md:w-56 md:border-0 md:pt-0">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>Progresso</span>
                <span className="tabular-nums">
                  {collected}/{total} ({Math.round(pct * 100)}%)
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <h1 className="text-2xl font-bold text-foreground">
          Set não encontrado
        </h1>
      )}

      {/* Toolbar: busca em pill + Adicionando em + ordenação e visualização */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="glass-pill flex h-10 w-full max-w-xs items-center gap-2.5 px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar cartas..."
            className="h-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {search.length > 0 && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

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
              <SelectItem value="number">Número</SelectItem>
              <SelectItem value="price-asc">Preço: Menor → Maior</SelectItem>
              <SelectItem value="price-desc">Preço: Maior → Menor</SelectItem>
              <SelectItem value="name-asc">Nome: A → Z</SelectItem>
              <SelectItem value="name-desc">Nome: Z → A</SelectItem>
              <SelectItem value="rarity">Raridade</SelectItem>
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

      {/* Sidebar de filtros aparente + conteúdo (sem items-start: o aside
          estica na linha e o sticky acompanha o scroll) */}
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

            {rarityOptions.length > 0 && (
              <FilterSection title="Raridade">
                <CheckboxFilterList
                  idPrefix="rarity"
                  options={rarityOptions.map(({ rarity, count }) => ({
                    value: rarity,
                    label: rarity,
                    count,
                  }))}
                  selected={selectedRarities}
                  onToggle={(rarity) =>
                    setSelectedRarities((prev) =>
                      prev.includes(rarity)
                        ? prev.filter((x) => x !== rarity)
                        : [...prev, rarity],
                    )
                  }
                />
              </FilterSection>
            )}
          </div>
        </aside>

        {/* Coluna de conteúdo */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Label da seção */}
          <SectionLabel>
            {loading
              ? "Carregando..."
              : `${filteredCards.length} carta${filteredCards.length !== 1 ? "s" : ""}`}
          </SectionLabel>

          {/* Cards */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: lista estática de placeholders
                <GridCardSkeleton key={i} />
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              {filteredCards.map((card) => (
                <ListRow
                  key={card.id}
                  card={card}
                  activePortfolioId={activePortfolioId}
                  quantity={collectionMap[card.id] ?? 0}
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
