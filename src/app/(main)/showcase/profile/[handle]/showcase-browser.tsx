"use client";

import { LayoutGrid, List, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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

  // Facetas de TCG e teto de preço a partir do portfólio ativo.
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
      <div className="glass-card !rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar nesta coleção..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Barra: portfólio + sort + view */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Portfólio:</span>
          {portfolios.length > 1 ? (
            <Select value={activeId} onValueChange={setActiveId}>
              <SelectTrigger className="h-8 w-auto gap-1 border-none bg-transparent px-1 font-bold text-primary shadow-none focus:ring-0">
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
              {active?.name ?? "—"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={(v) => setSort(v as SortValue)}>
            <SelectTrigger className="h-8 w-auto gap-1.5 text-xs">
              <span className="text-muted-foreground">Ordenar:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value-desc">Maior valor</SelectItem>
              <SelectItem value="value-asc">Menor valor</SelectItem>
              <SelectItem value="name">Nome (A–Z)</SelectItem>
              <SelectItem value="qty-desc">Quantidade</SelectItem>
            </SelectContent>
          </Select>

          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v as ViewMode)}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="grid" aria-label="Grade">
              <LayoutGrid className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="Lista">
              <List className="size-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Filtros + resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar de filtros */}
        <aside className="space-y-5">
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

        {/* Grid / lista */}
        <div>
          {items.length === 0 ? (
            <div className="glass-card !rounded-xl p-12 text-center">
              <p className="text-sm font-semibold text-foreground">
                Nenhuma carta encontrada.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ajuste a busca ou os filtros.
              </p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/card/${item.cardId}`}
                  className="group space-y-2"
                >
                  <div className="glass-card !rounded-xl p-2 relative">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={240}
                      height={336}
                      sizes="(max-width: 640px) 45vw, 22vw"
                      className="w-full h-auto rounded-lg transition-transform group-hover:scale-[1.02]"
                    />
                    {item.quantity > 1 && (
                      <span className="absolute top-3 right-3 rounded-full bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5">
                        x{item.quantity}
                      </span>
                    )}
                  </div>
                  <div className="px-1">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {item.setName ?? item.setCode}
                    </p>
                    <p className="text-xs font-bold text-foreground font-mono">
                      R$ {formatPrice(item.totalValue)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/card/${item.cardId}`}
                  className="glass-card !rounded-xl p-2 flex items-center gap-3 hover:bg-muted/40 transition-colors"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={48}
                    height={67}
                    className="h-14 w-auto rounded-md shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {(item.setName ?? item.setCode) +
                        (item.rarity ? ` • ${item.rarity}` : "")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground font-mono">
                      R$ {formatPrice(item.totalValue)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Qtd {item.quantity}
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
