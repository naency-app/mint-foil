"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
import { useCards } from "@/hooks/use-cards";
import type { Card as CardType } from "@/lib/api";
import { IconLayoutGrid, IconListDetails } from "@tabler/icons-react";
import {
  ArrowUpDown,
  ChevronRight,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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

function FilterCheckbox({ label, id }: { label: string; id: string }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} />
      <label
        htmlFor={id}
        className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
      >
        {label}
      </label>
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

function GridCard({ card }: { card: CardType }) {
  const price = getLatestPrice(card);

  return (
    <Link href={`/card/${card.id}`} className="block">
      <Card className="group w-full h-full overflow-hidden dark:border dark:border-slate-800 bg-card backdrop-blur-sm hover:bg-background/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 py-0">
        <CardContent className="p-0 relative">
          <div className="overflow-hidden p-2 h-fit">
            <Image
              src={card.imageUrl}
              alt={card.name}
              className="w-full rounded-lg aspect-2/3 object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              width={200}
              height={200}
            />
          </div>
          <button
            type="button"
            className="absolute bottom-2 right-2 z-10 size-7 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Plus className="size-3.5" />
          </button>
        </CardContent>
        <div className="p-3 space-y-1.5">
          <h3 className="text-md font-bold text-foreground truncate leading-tight">
            {card.name}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {card.setName ?? card.setCode}
          </p>
          <p className="text-xs text-muted-foreground leading-tight">
            {card.rarity} • {card.setCode}
          </p>
          {card.cardType && (
            <p className="text-xs text-muted-foreground">{card.cardType}</p>
          )}
          <div className="pt-1 border-t border-border">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="size-4 text-emerald-400" />
                  <span className="text-sm font-bold text-foreground font-mono">
                    R$ {formatPrice(price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ListRow({ card }: { card: CardType }) {
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
        </div>

        <div className="hidden md:block flex-1 min-w-0">
          <p className="text-xs text-blue-400 truncate">
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
              R$ {formatPrice(price)}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="shrink-0 size-8 rounded-full border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </Link>
  );
}

export default function ExplorePage() {
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("best-match");
  const [searchInput, setSearchInput] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { cards, loading, error, search, setSearch } = useCards();

  function handleSearch() {
    setSearch(searchInput);
  }

  function handleClear() {
    setSearchInput("");
    setSearch("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  const sortedCards = [...cards].sort((a, b) => {
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

  return (
    <main className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <section className="rounded-xl border border-border bg-card backdrop-blur-sm p-4 space-y-3">
        <h2 className="text-sm font-bold text-foreground">
          Buscar um Produto
        </h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="search-products"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar qualquer carta, produto selado ou acessório..."
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>Buscar</Button>
          <Button variant="secondary" onClick={handleClear}>
            Limpar
          </Button>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDrawerOpen(true)}
            className="border-border text-muted-foreground hover:text-foreground hover:bg-muted h-8 text-xs gap-1.5 cursor-pointer lg:hidden"
          >
            <SlidersHorizontal className="size-3.5" />
            Filtros
          </Button>
          <p className="text-xs text-muted-foreground hidden sm:block">
            {loading ? (
              <span className="flex items-center gap-1">
                <Loader2 className="size-3 animate-spin" /> Buscando...
              </span>
            ) : (
              `${sortedCards.length} resultados encontrados`
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 border-border bg-muted text-foreground text-xs min-w-[160px]">
                <ArrowUpDown className="size-3.5 text-muted-foreground" />{" "}
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
          </div>

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

      {/* Mobile Filters Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="bg-background border-border max-h-[85vh]">
          <DrawerHeader className="flex flex-row items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <DrawerClose asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </DrawerClose>
              <DrawerTitle className="text-base font-bold text-foreground">
                Filtros
              </DrawerTitle>
            </div>
            <button
              type="button"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
            >
              Reset All
            </button>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-5 pb-4">
            <button
              type="button"
              className="flex items-center justify-between w-full py-3.5 border-b border-border cursor-pointer group"
            >
              <span className="text-sm text-foreground font-medium">Sort</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Best Match
                </span>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground" />
              </div>
            </button>

            <button
              type="button"
              className="flex items-center justify-between w-full py-3.5 border-b border-border cursor-pointer group"
            >
              <div>
                <span className="text-sm text-foreground font-medium block">
                  Tipo de Produto
                </span>
                <span className="text-xs text-muted-foreground">
                  Filtrar por tipo de produto.
                </span>
              </div>
              <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground shrink-0" />
            </button>

            <button
              type="button"
              className="flex items-center justify-between w-full py-3.5 border-b border-border cursor-pointer group"
            >
              <div>
                <span className="text-sm text-foreground font-medium block">
                  Categoria
                </span>
                <span className="text-xs text-muted-foreground">
                  Selecione uma categoria abaixo.
                </span>
              </div>
              <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground shrink-0" />
            </button>

            <div className="flex items-center justify-between py-3.5">
              <span className="text-sm text-foreground font-medium">
                Formato de Visualização
              </span>
              <div className="flex items-center border border-border rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewType("grid")}
                  className={`flex items-center justify-center size-8 transition-colors cursor-pointer ${
                    viewType === "grid"
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewType("list")}
                  className={`flex items-center justify-center size-8 transition-colors cursor-pointer ${
                    viewType === "list"
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          <DrawerFooter className="px-5 pb-6">
            <DrawerClose asChild>
              <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold h-11 text-sm cursor-pointer">
                Mostrar Resultados
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex gap-6">
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-20 rounded-xl border border-border bg-card backdrop-blur-sm p-4 space-y-5 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <FilterSection title="Tipo de Produto">
              <p className="text-xs text-muted-foreground -mt-1">
                Filtrar por tipo de produto.
              </p>
              <div className="space-y-1.5">
                <FilterCheckbox label="Apenas Cartas" id="cards-only" />
                <FilterCheckbox label="Apenas Selados" id="sealed-only" />
              </div>
            </FilterSection>

            <Separator />

            <FilterSection title="Faixa de Preço" badge="PRO">
              <p className="text-xs text-muted-foreground -mt-1">
                Mostrar produtos dentro de uma faixa de preço (inclusive).
              </p>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Min."
                  className="h-8 bg-muted border-border text-foreground text-xs placeholder:text-muted-foreground"
                />
                <span className="text-xs text-muted-foreground">a</span>
                <Input
                  placeholder="Max."
                  className="h-8 bg-muted border-border text-foreground text-xs placeholder:text-muted-foreground"
                />
              </div>
            </FilterSection>

            <Separator />

            <FilterSection title="Categoria">
              <p className="text-xs text-muted-foreground -mt-1">
                Selecione uma categoria abaixo.
              </p>
              <div className="space-y-1.5">
                <FilterCheckbox label="Pokémon" id="cat-pokemon" />
                <FilterCheckbox label="Magic: The Gathering" id="cat-magic" />
                <FilterCheckbox label="Yu-Gi-Oh!" id="cat-yugioh" />
                <FilterCheckbox label="One Piece" id="cat-onepiece" />
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

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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
                  : "O catálogo está vazio. Adicione cartas via seed."}
              </p>
            </div>
          ) : viewType === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {sortedCards.map((card) => (
                <GridCard key={card.id} card={card} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedCards.map((card) => (
                <ListRow key={card.id} card={card} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
