"use client";

import { IconLayoutGrid, IconListDetails } from "@tabler/icons-react";
import { ArrowUpDown, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CheckboxFilterList,
  FilterSection,
  PriceRangeFilter,
  ProductTypeFilter,
  type ProductTypeValue,
  facetOptions,
  toggleValue,
} from "@/app/components/filters";
import { TcgCard } from "@/app/components/TcgCard";
import { GlassPill } from "@/components/ui/glass";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);

  const active =
    portfolios.find((p) => p.id === activeId) ?? portfolios[0] ?? null;
  const allItems = active?.items ?? [];

  const tcgFacets = useMemo(
    () => facetOptions(allItems, (i) => i.tcgName),
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
  }, [allItems, search, productType, tcgs, priceRange, sort]);

  return (
    <div className="space-y-5">
      {/* Busca */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar nesta coleção..."
          className="h-12 rounded-2xl pl-11"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar de filtros — mesmo padrão do /explore */}
        <aside className="glass-card sticky top-20 max-h-[calc(100vh-6rem)] space-y-5 overflow-y-auto !rounded-2xl p-4">
          <ProductTypeFilter value={productType} onChange={setProductType} />
          {tcgFacets.length > 0 && (
            <FilterSection title="Categoria">
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
          <PriceRangeFilter
            isPro
            value={priceRange}
            ceil={priceCeil}
            onChange={setPriceRange}
            onUpsell={() => {}}
          />
        </aside>

        {/* Conteúdo: barra (portfólio + sort + view) + grid/lista */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Portfólio:</span>
              {portfolios.length > 1 ? (
                <Select value={activeId} onValueChange={setActiveId}>
                  <SelectTrigger
                    size="sm"
                    className="glass-pill cursor-pointer gap-1 rounded-full border text-xs font-bold text-primary shadow-none"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {portfolios.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.itemCount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="font-bold text-primary">
                  {active?.name ?? "—"} ({active?.itemCount ?? 0})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Select value={sort} onValueChange={(v) => setSort(v as SortValue)}>
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
                  <div className="size-12 shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
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
