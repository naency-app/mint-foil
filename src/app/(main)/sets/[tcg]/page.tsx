"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import SpotlightCards, {
  type SpotlightItem,
} from "@/components/kokonutui/spotlight-cards";
import { api, type CardSet, type Tcg } from "@/lib/api";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Layers,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const TCG_COLOR: Record<string, string> = {
  pokemon: "#f59e0b",
  magic: "#e05c2a",
  yugioh: "#7c3aed",
  onepiece: "#0ea5e9",
};

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

function toSpotlightItem(
  set: CardSet,
  tcgSlug: string,
  color: string,
): SpotlightItem {
  const cardCount = set._count?.cards ?? 0;
  const date = formatDate(set.releaseDate);
  const descParts = [`${cardCount} cartas`];
  if (date) descParts.push(date);
  else descParts.push(set.code);

  return {
    image: set.imageUrl ?? undefined,
    title: set.name,
    description: descParts.join(" • "),
    color,
    href: `/sets/${tcgSlug}/${set.slug}`,
  };
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

function SetRow({
  set,
  tcgSlug,
}: {
  set: CardSet;
  tcgSlug: string;
}) {
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

export default function TcgSetsPage() {
  const { tcg: tcgSlug } = useParams<{ tcg: string }>();
  const [tcg, setTcg] = useState<Tcg | null>(null);
  const [sets, setSets] = useState<CardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const color = TCG_COLOR[tcgSlug] ?? "#6b7280";

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
        setSets(setsData);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tcgSlug]);

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

  const spotlightItems = setsWithCards.map((s) =>
    toSpotlightItem(s, tcgSlug, color),
  );

  return (
    <main className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/sets" className="hover:text-foreground transition-colors">
          Sets
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground font-medium">
          {tcg?.name ?? tcgSlug}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link
            href="/sets"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
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

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar sets..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
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
          {/* Sets with cards — SpotlightCards grid */}
          {setsWithCards.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Layers className="size-3.5" />
                Sets com cartas ({setsWithCards.length})
              </h2>
              <SpotlightCards
                items={spotlightItems}
                className="dark:bg-transparent p-0"
              />
            </section>
          )}

          {/* Sets without cards — compact list */}
          {setsWithoutCards.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Layers className="size-3.5 opacity-50" />
                Aguardando sync ({setsWithoutCards.length})
              </h2>
              <div className="space-y-1.5">
                {setsWithoutCards.slice(0, 20).map((set) => (
                  <SetRow key={set.id} set={set} tcgSlug={tcgSlug} />
                ))}
                {setsWithoutCards.length > 20 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    + {setsWithoutCards.length - 20} sets restantes
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
