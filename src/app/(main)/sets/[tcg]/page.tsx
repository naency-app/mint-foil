"use client";

import {
  Calendar,
  ChevronRight,
  Layers,
  Loader2,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { Suspense, useEffect, useMemo, useState } from "react";
import { CheckboxFilterList, FilterSection } from "@/app/components/filters";
import { PortfolioSelector } from "@/app/components/PortfolioSelector";
import { SetCard } from "@/app/components/SetCard";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionLabel } from "@/components/ui/glass";
import { Skeleton } from "@/components/ui/skeleton";
import type { CardSet, Portfolio } from "@/lib/api";
import {
  useCardSets,
  useInvalidateCollection,
  usePortfolioDetail,
  usePortfolios,
  useTcgs,
} from "@/lib/queries";

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

/** Skeleton 1:1 com o SetCard do grid — mesma estrutura, sem layout shift */
function SetCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden !rounded-2xl">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="p-3 pt-0">
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
    </div>
  );
}

/** Linha compacta dos sets ainda sem cartas sincronizadas */
function SetRow({ set }: { set: CardSet }) {
  const date = formatDate(set.releaseDate);

  return (
    <div className="glass-card flex items-center gap-4 !rounded-2xl p-3 opacity-50">
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {set.imageUrl ? (
          // biome-ignore lint/performance/noImgElement: thumbs pequenos de fontes variadas, sem otimização necessária
          <img
            src={set.imageUrl}
            alt={set.name}
            className="size-full object-cover"
          />
        ) : (
          <Layers className="size-4 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-foreground">
          {set.name}
        </h3>
        <div className="mt-0.5 flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">
            {set.code}
          </span>
          {date && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3" />
              {date}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TcgSetsPageContent() {
  const { tcg: tcgSlug } = useParams<{ tcg: string }>();
  const router = useRouter();
  const [search, setSearch] = useQueryState("q", {
    defaultValue: "",
    throttleMs: 300,
  });

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolioId, setActivePortfolioId] = useState("");

  // Filtros da sidebar
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedProgress, setSelectedProgress] = useState<string[]>([]);

  // Dados via TanStack Query — useCardSets compartilha cache com o carrossel
  // do Explore (mesma queryKey ['card-sets', tcg])
  const tcgsQuery = useTcgs();
  const setsQuery = useCardSets(tcgSlug);
  const loading = tcgsQuery.isPending || setsQuery.isPending;
  const tcg = tcgsQuery.data?.find((t) => t.slug === tcgSlug) ?? null;

  const portfoliosQuery = usePortfolios();
  const portfolioDetail = usePortfolioDetail(activePortfolioId || undefined);
  const invalidateCollection = useInvalidateCollection();

  // Sets com imagem primeiro (getcollectr > ygoprodeck), sort estável
  const sets = useMemo(() => {
    const rank = (s: CardSet) =>
      s.imageUrl?.includes("getcollectr")
        ? 0
        : s.imageUrl?.includes("ygoprodeck")
          ? 1
          : 2;
    return [...(setsQuery.data ?? [])].sort((a, b) => rank(a) - rank(b));
  }, [setsQuery.data]);

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

  // Progresso por set (cartas únicas) a partir do detalhe do portfólio
  const setProgressMap = useMemo(() => {
    const progressMap: Record<string, { count: number; value: number }> = {};
    for (const item of portfolioDetail.data?.items ?? []) {
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
  }, [portfolioDetail.data]);

  // Anos presentes na listagem, para o filtro (mais recentes primeiro)
  const yearOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of sets) {
      if (!s.releaseDate) continue;
      const year = String(new Date(s.releaseDate).getFullYear());
      counts.set(year, (counts.get(year) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([year, count]) => ({ year, count }));
  }, [sets]);

  const filteredSets = useMemo(() => {
    function progressBucket(set: CardSet): string {
      const total = set.totalCards ?? set._count?.cards ?? 0;
      const collected = setProgressMap[set.code]?.count ?? 0;
      if (collected === 0) return "none";
      if (total > 0 && collected >= total) return "complete";
      return "started";
    }

    let result = sets;
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.code.toLowerCase().includes(term),
      );
    }
    if (selectedYears.length > 0) {
      result = result.filter(
        (s) =>
          s.releaseDate &&
          selectedYears.includes(String(new Date(s.releaseDate).getFullYear())),
      );
    }
    if (selectedProgress.length > 0) {
      result = result.filter((s) =>
        selectedProgress.includes(progressBucket(s)),
      );
    }
    return result;
  }, [sets, search, selectedYears, selectedProgress, setProgressMap]);

  const setsWithCards = filteredSets.filter((s) => (s._count?.cards ?? 0) > 0);
  const setsWithoutCards = filteredSets.filter(
    (s) => (s._count?.cards ?? 0) === 0,
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Breadcrumb (mesmo padrão da página da carta) */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/sets" className="hover:text-primary transition-colors">
          Sets
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground">{tcg?.name ?? tcgSlug}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {tcg?.name ?? tcgSlug}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading
              ? "Carregando..."
              : `${sets.length} sets • ${setsWithCards.length} com cartas catalogadas`}
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          {portfolios.length > 0 && (
            <PortfolioSelector
              portfolios={portfolios}
              activePortfolioId={activePortfolioId}
              onSelect={setActivePortfolioId}
              onRefresh={invalidateCollection}
              labelPrefix="Adicionando em"
            />
          )}

          <div className="glass-pill flex h-10 w-full items-center gap-2.5 px-4 sm:w-72">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar sets..."
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
        </div>
      </div>

      {/* Sidebar de filtros aparente + conteúdo (sem items-start: o aside
          estica na linha e o sticky acompanha o scroll) */}
      <div className="flex gap-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="glass-card sticky top-20 max-h-[calc(100vh-6rem)] space-y-5 overflow-y-auto p-4">
            {yearOptions.length > 0 && (
              <FilterSection title="Ano de Lançamento">
                <CheckboxFilterList
                  idPrefix="year"
                  options={yearOptions.map(({ year, count }) => ({
                    value: year,
                    label: year,
                    count,
                  }))}
                  selected={selectedYears}
                  onToggle={(year) =>
                    setSelectedYears((prev) =>
                      prev.includes(year)
                        ? prev.filter((x) => x !== year)
                        : [...prev, year],
                    )
                  }
                />
              </FilterSection>
            )}

            <FilterSection title="Progresso da Coleção">
              <div className="space-y-2 pt-2">
                {[
                  { key: "none", label: "Não começado" },
                  { key: "started", label: "Em progresso" },
                  { key: "complete", label: "Completo" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      id={`progress-${key}`}
                      checked={selectedProgress.includes(key)}
                      onCheckedChange={() =>
                        setSelectedProgress((prev) =>
                          prev.includes(key)
                            ? prev.filter((x) => x !== key)
                            : [...prev, key],
                        )
                      }
                    />
                    <label
                      htmlFor={`progress-${key}`}
                      className="cursor-pointer select-none text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </FilterSection>
          </div>
        </aside>

        {/* Coluna de conteúdo */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 10 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: lista estática de placeholders
                <SetCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredSets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="size-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Nenhum set encontrado
              </h3>
              <p className="text-sm text-muted-foreground">
                {search
                  ? `Nenhum resultado para "${search}".`
                  : "Nenhum set disponível para este TCG."}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Sets com cartas — grid de SetCard */}
              {setsWithCards.length > 0 && (
                <section className="space-y-3">
                  <SectionLabel>
                    Sets com cartas ({setsWithCards.length})
                  </SectionLabel>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
                    {setsWithCards.map((set) => (
                      <SetCard
                        key={set.id}
                        set={set}
                        progress={setProgressMap[set.code]}
                        onClick={() =>
                          router.push(`/sets/${tcgSlug}/${set.slug}`)
                        }
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Sets sem cartas — lista compacta */}
              {setsWithoutCards.length > 0 && (
                <section className="space-y-3">
                  <SectionLabel>
                    Aguardando sync ({setsWithoutCards.length})
                  </SectionLabel>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {setsWithoutCards.slice(0, 40).map((set) => (
                      <SetRow key={set.id} set={set} />
                    ))}
                  </div>
                  {setsWithoutCards.length > 40 && (
                    <p className="py-2 text-center text-xs text-muted-foreground">
                      + {setsWithoutCards.length - 40} sets restantes aguardando
                      sincronização
                    </p>
                  )}
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function TcgSetsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="animate-spin text-primary size-8" />
        </div>
      }
    >
      <TcgSetsPageContent />
    </Suspense>
  );
}
