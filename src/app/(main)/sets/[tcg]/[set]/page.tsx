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
import { api, type Card as CardType, type CardSet, type Portfolio } from "@/lib/api";
import { IconFolder, IconLayoutGrid, IconListDetails } from "@tabler/icons-react";
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
import { useEffect, useMemo, useState } from "react";

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
}: {
  card: CardType;
  activePortfolioId: string;
}) {
  const price = getLatestPrice(card);

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
            {card.rarity} • {card.setCode}
          </p>
        </div>

        <div className="text-right shrink-0 w-32">
          <div className="flex items-center justify-end gap-1">
            <TrendingUp className="size-3 text-emerald-400" />
            <span className="text-sm font-bold text-foreground font-mono">
              R$ {formatPrice(price)}
            </span>
          </div>
        </div>

        <AddToPortfolioButton
          cardId={card.id}
          defaultPortfolioId={activePortfolioId}
          triggerClassName="shrink-0 size-8 rounded-full border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
        />
      </div>
    </Link>
  );
}

export default function SetCardsPage() {
  const { tcg: tcgSlug, set: setSlug } = useParams<{
    tcg: string;
    set: string;
  }>();
  const [setInfo, setSetInfo] = useState<CardSet | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("number");
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolioId, setActivePortfolioId] = useState("");

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

  useEffect(() => {
    api.collection
      .portfolios()
      .then((data) => {
        setPortfolios(data);
        if (data.length > 0) setActivePortfolioId(data[0].id);
      })
      .catch(() => {});
  }, []);

  const filteredCards = useMemo(() => {
    let result = cards;
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.setCode.toLowerCase().includes(term) ||
          c.rarity.toLowerCase().includes(term),
      );
    }

    return [...result].sort((a, b) => {
      const priceA = getLatestPrice(a);
      const priceB = getLatestPrice(b);
      switch (sortBy) {
        case "price-asc": return priceA - priceB;
        case "price-desc": return priceB - priceA;
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        case "rarity": return b.rarity.localeCompare(a.rarity);
        default: return a.setCode.localeCompare(b.setCode);
      }
    });
  }, [cards, search, sortBy]);

  const tcgName = setInfo?.tcg?.name ?? tcgSlug;

  return (
    <main className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
        <span className="text-foreground font-medium">
          {setInfo?.name ?? setSlug}
        </span>
      </div>

      {/* Set header */}
      <div>
        <Link
          href={`/sets/${tcgSlug}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
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
          <div className="flex items-start gap-4">
            {setInfo.imageUrl && (
              <div className="size-16 rounded-lg bg-muted overflow-hidden shrink-0">
                <img
                  src={setInfo.imageUrl}
                  alt={setInfo.name}
                  className="size-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {setInfo.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline" className="font-mono text-xs">
                  {setInfo.code}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {cards.length} cartas
                </span>
                {setInfo.releaseDate && (
                  <span className="text-sm text-muted-foreground">
                    {new Date(setInfo.releaseDate).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
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
              <Separator orientation="vertical" className="h-5 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-1.5">
                <IconFolder className="size-3.5 text-muted-foreground shrink-0" />
                <Select value={activePortfolioId} onValueChange={setActivePortfolioId}>
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
              variant={viewType === "grid" ? "default" : "outline"}
              onClick={() => setViewType("grid")}
            >
              <IconLayoutGrid className="size-4" />
            </Button>
            <Button
              size="icon"
              variant={viewType === "list" ? "default" : "outline"}
              onClick={() => setViewType("list")}
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

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredCards.map((card) => (
            <Link key={card.id} href={`/card/${card.id}`} className="block">
              <TcgCard
                name={card.name}
                price={formatPrice(getLatestPrice(card))}
                imageUrl={card.imageUrl}
                setCode={card.setCode}
                change={getPriceChange(card)}
                cardId={card.id}
                defaultPortfolioId={activePortfolioId}
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCards.map((card) => (
            <ListRow
              key={card.id}
              card={card}
              activePortfolioId={activePortfolioId}
            />
          ))}
        </div>
      )}
    </main>
  );
}
