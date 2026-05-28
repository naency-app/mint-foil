"use client";

import { PortfolioSelector } from "@/app/components/PortfolioSelector";
import { SetCard } from "@/app/components/SetCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  api,
  type CardSet,
  type CollectionItem,
  type Portfolio,
  type Tcg,
} from "@/lib/api";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Layers,
  Loader2,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

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

function SetRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
      <Skeleton className="size-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

function SetRow({ set }: { set: CardSet }) {
  const date = formatDate(set.releaseDate);

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card/50 opacity-50">
      <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
        {set.imageUrl ? (
          <img
            src={set.imageUrl}
            alt={set.name}
            className="size-full object-cover"
          />
        ) : (
          <Layers className="size-4 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground truncate">
          {set.name}
        </h3>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-muted-foreground font-mono">
            {set.code}
          </span>
          {date && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
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
  const [tcg, setTcg] = useState<Tcg | null>(null);
  const [sets, setSets] = useState<CardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useQueryState("q", {
    defaultValue: "",
    throttleMs: 300,
  });

  // Portfolio tracking for collection progress
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolioId, setActivePortfolioId] = useState("");
  const [portfolioItems, setPortfolioItems] = useState<CollectionItem[]>([]);

  // Load basic TCG info and sets
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [tcgs, setsData] = await Promise.all([
          api.cards.tcgs(),
          api.cards.sets(tcgSlug),
        ]);
        const found = tcgs.find((t) => t.slug === tcgSlug);
        setTcg(found ?? null);

        // Sort sets: getcollectr images first, then ygoprodeck, then others (stable sort)
        const sorted = [...setsData].sort((a, b) => {
          const rank = (s: any) =>
            s.imageUrl?.includes("getcollectr")
              ? 0
              : s.imageUrl?.includes("ygoprodeck")
                ? 1
                : 2;
          return rank(a) - rank(b);
        });

        setSets(sorted);
      } catch (err) {
        console.error("Error loading TCG sets", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tcgSlug]);

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

  // Load portfolios
  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // Fetch portfolio details to compute set progress
  useEffect(() => {
    if (!activePortfolioId) {
      setPortfolioItems([]);
      return;
    }
    api.collection
      .getPortfolio(activePortfolioId)
      .then((data) => {
        setPortfolioItems(data.items);
      })
      .catch(() => {
        setPortfolioItems([]);
      });
  }, [activePortfolioId]);

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

  const filteredSets = useMemo(() => {
    if (!search) return sets;
    const term = search.toLowerCase();
    return sets.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.code.toLowerCase().includes(term),
    );
  }, [sets, search]);

  const setsWithCards = filteredSets.filter((s) => (s._count?.cards ?? 0) > 0);
  const setsWithoutCards = filteredSets.filter(
    (s) => (s._count?.cards ?? 0) === 0,
  );

  return (
    <main className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
        <Link href="/sets" className="hover:text-foreground transition-colors">
          Sets
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground">{tcg?.name ?? tcgSlug}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link
            href="/sets"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2 font-mono uppercase"
          >
            <ArrowLeft className="size-3" />
            Voltar
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {tcg?.name ?? tcgSlug}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading
              ? "Carregando..."
              : `${sets.length} sets encontrados • ${setsWithCards.length} com cartas catalogadas`}
          </p>
        </div>

        {/* Portfolio selector & Search filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {portfolios.length > 0 && (
            <PortfolioSelector
              portfolios={portfolios}
              activePortfolioId={activePortfolioId}
              onSelect={setActivePortfolioId}
              onRefresh={fetchPortfolios}
              labelPrefix="Adicionando a:"
            />
          )}

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar sets..."
              className="pl-10 h-9"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <SetRowSkeleton key={i} />
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
          {/* Sets with cards — SetCard grid */}
          {setsWithCards.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Layers className="size-3.5 text-muted-foreground" />
                Sets com cartas ({setsWithCards.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {setsWithCards.map((set) => (
                  <SetCard
                    key={set.id}
                    set={set}
                    progress={setProgressMap[set.code]}
                    onClick={() => router.push(`/sets/${tcgSlug}/${set.slug}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Sets without cards — compact list */}
          {setsWithoutCards.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Layers className="size-3.5 opacity-50" />
                Aguardando sync ({setsWithoutCards.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {setsWithoutCards.slice(0, 40).map((set) => (
                  <SetRow key={set.id} set={set} />
                ))}
              </div>
              {setsWithoutCards.length > 40 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  + {setsWithoutCards.length - 40} sets restantes aguardando
                  sincronização
                </p>
              )}
            </section>
          )}
        </div>
      )}
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
