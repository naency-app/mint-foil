"use client";

import { IconLayoutGrid, IconListDetails } from "@tabler/icons-react";
import { ArrowUpDown, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CheckboxFilterList,
  FilterSection,
  facetOptions,
  PriceRangeFilter,
  ProductTypeFilter,
  type ProductTypeValue,
  toggleValue,
} from "@/app/components/filters";
import { PortfolioSelector } from "@/app/components/PortfolioSelector";
import { TcgCard } from "@/app/components/TcgCard";
import { GlassPill } from "@/components/ui/glass";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Portfolio } from "@/lib/api";
import type { ShowcasePortfolio } from "./types";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type SortValue = "value-desc" | "value-asc" | "name" | "qty-desc";
type ViewMode = "grid" | "list";

export function ShowcaseBrowser({
  portfolios,
}: {
  portfolios: ShowcasePortfolio[];
}) {
  const [activeId, setActiveId] = useState(portfolios[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortValue>("value-desc");
  const [view, setView] = useState<ViewMode>("grid");
  const [productType, setProductType] = useState<ProductTypeValue>("all");
  const [tcgs, setTcgs] = useState<string[]>([]);
  const [rarities, setRarities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);

  const active =
    portfolios.find((p) => p.id === activeId) ?? portfolios[0] ?? null;
  const allItems = active?.items ?? [];

  // PortfolioSelector espera o tipo Portfolio da API — mapeamos o showcase.
  const selectorPortfolios: Portfolio[] = useMemo(
    () =>
      portfolios.map((p) => ({
        id: p.id,
        name: p.name,
        userId: "",
        createdAt: "",
        updatedAt: "",
        _count: { items: p.itemCount },
      })),
    [portfolios],
  );

  const tcgFacets = useMemo(
    () => facetOptions(allItems, (i) => i.tcgName),
    [allItems],
  );
  const rarityFacets = useMemo(
    () => facetOptions(allItems, (i) => i.rarity),
    [allItems],
  );
  const priceCeil = useMemo(
    () => Math.max(50, ...allItems.map((i) => Math.ceil(i.unitValue))),
    [allItems],
  );

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = allItems.filter((i) => {
      if (productType === "single" && i.productType !== "SINGLE") return false;
      if (productType === "sealed" && i.productType !== "SEALED") return false;
      if (tcgs.length > 0 && (!i.tcgName || !tcgs.includes(i.tcgName)))
        return false;
      if (rarities.length > 0 && !rarities.includes(i.rarity)) return false;
      if (priceRange) {
        if (i.unitValue < priceRange[0] || i.unitValue > priceRange[1])
          return false;
      }
      if (q) {
        const hay =
          `${i.name} ${i.setName ?? ""} ${i.setCode} ${i.rarity}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      switch (sort) {
        case "value-asc":
          return a.totalValue - b.totalValue;
        case "name":
          return a.name.localeCompare(b.name);
        case "qty-desc":
          return b.quantity - a.quantity;
        default:
          return b.totalValue - a.totalValue;
      }
    });
  }, [allItems, search, productType, tcgs, rarities, priceRange, sort]);

  return (
    <div className="space-y-4">
      {/* Busca — mesmo pill de vidro do /explore, largura total */}
      <div className="relative w-full">
        <div className="glass-pill flex h-11 items-center gap-2.5 px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar nesta coleção..."
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

      {/* Marketplace: sidebar de filtros + conteúdo (padrão do /explore) */}
      <div className="flex gap-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="glass-card sticky top-20 max-h-[calc(100vh-6rem)] space-y-5 overflow-y-auto p-4">
            <ProductTypeFilter value={productType} onChange={setProductType} />
            {tcgFacets.length > 0 && (
              <FilterSection title="Jogo / Categoria">
                <CheckboxFilterList
                  idPrefix="tcg"
                  options={tcgFacets.map((f) => ({
                    value: f.value,
                    label: f.value,
                    count: f.count,
                  }))}
                  selected={tcgs}
                  onToggle={(v) => setTcgs((prev) => toggleValue(prev, v))}
                />
              </FilterSection>
            )}
            {rarityFacets.length > 0 && (
              <FilterSection title="Raridade">
                <CheckboxFilterList
                  idPrefix="rarity"
                  options={rarityFacets.map((f) => ({
                    value: f.value,
                    label: f.value,
                    count: f.count,
                  }))}
                  selected={rarities}
                  onToggle={(v) => setRarities((prev) => toggleValue(prev, v))}
                />
              </FilterSection>
            )}
            <PriceRangeFilter
              isPro
              value={priceRange}
              ceil={priceCeil}
              onChange={setPriceRange}
              onUpsell={() => {}}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          {/* Barra: portfólio + sort + view */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PortfolioSelector
              portfolios={selectorPortfolios}
              activePortfolioId={activeId}
              onSelect={setActiveId}
              readOnly
            />

            <div className="flex items-center gap-2">
              <Select
                value={sort}
                onValueChange={(v) => setSort(v as SortValue)}
              >
                <SelectTrigger
                  size="sm"
                  className="glass-pill cursor-pointer gap-1.5 rounded-full border text-xs font-bold text-foreground shadow-none"
                >
                  <ArrowUpDown className="size-3.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="value-desc">Maior valor</SelectItem>
                  <SelectItem value="value-asc">Menor valor</SelectItem>
                  <SelectItem value="name">Nome: A → Z</SelectItem>
                  <SelectItem value="qty-desc">Quantidade</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <GlassPill
                  active={view === "grid"}
                  onClick={() => setView("grid")}
                  className="px-2.5 py-1.5"
                  aria-label="Visualizar em grade"
                >
                  <IconLayoutGrid className="size-4" />
                </GlassPill>
                <GlassPill
                  active={view === "list"}
                  onClick={() => setView("list")}
                  className="px-2.5 py-1.5"
                  aria-label="Visualizar em lista"
                >
                  <IconListDetails className="size-4" />
                </GlassPill>
              </div>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="glass-card !rounded-2xl p-12 text-center">
              <p className="text-sm font-semibold text-foreground">
                Nenhuma carta encontrada.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Ajuste a busca ou os filtros.
              </p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <TcgCard
                  key={item.id}
                  name={item.name}
                  price={formatPrice(item.unitValue)}
                  priceChange={item.priceChange}
                  change={item.changePercent}
                  imageUrl={item.imageUrl}
                  collectorNumber={item.collectorNumber}
                  setName={item.setName}
                  tcgSlug={item.tcgSlug ?? undefined}
                  setSlug={item.setSlug ?? undefined}
                  rarity={item.rarity}
                  quantity={item.quantity}
                  cardId={item.cardId}
                  cardHref={`/card/${item.cardId}`}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/card/${item.cardId}`}
                  className="glass-card group flex items-center gap-4 !rounded-2xl px-4 py-3 transition-all hover:bg-muted/30"
                >
                  <div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted/30">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={48}
                      height={64}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      {item.name}
                    </h3>
                    <p className="truncate text-xs text-tertiary">
                      {item.setName ?? item.setCode}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.rarity}
                      {item.collectorNumber ? ` • ${item.collectorNumber}` : ""}
                    </p>
                  </div>
                  <div className="w-36 shrink-0 text-right">
                    <span className="font-mono text-sm font-bold text-foreground">
                      R$ {formatPrice(item.totalValue)}
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Quant. {item.quantity}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
