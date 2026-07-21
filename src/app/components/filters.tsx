"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionLabel } from "@/components/ui/glass";
import { Slider } from "@/components/ui/slider";

/**
 * Blocos da sidebar de filtros estilo marketplace (Explore, página de set…).
 * Os filtros PRO são funcionais para assinantes; para os demais são
 * decorativos e o clique chama onUpsell (abre o ProUpgradeModal).
 */

export const FILTER_LANGUAGES = [
  { code: "en", name: "Inglês" },
  { code: "ja", name: "Japonês" },
  { code: "zh", name: "Chinês" },
];

export function FilterSection({
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
        <SectionLabel>{title}</SectionLabel>
        {badge && (
          <Badge variant="default" className="h-4 px-1.5 text-[9px]">
            {badge}
          </Badge>
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * Lista de checkboxes com limite de itens visíveis — listas derivadas dos
 * dados (anos, raridades…) podem crescer muito; acima de `limit` entra o
 * "Ver mais/menos" pra sidebar não virar um paredão.
 */
export function CheckboxFilterList({
  idPrefix,
  options,
  selected,
  onToggle,
  limit = 6,
}: {
  idPrefix: string;
  options: { value: string; label: string; count?: number }[];
  selected: string[];
  onToggle: (value: string) => void;
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  // Selecionados nunca somem ao recolher — senão o usuário perde de vista
  // um filtro ativo
  const visible = expanded
    ? options
    : options.filter((o, i) => i < limit || selected.includes(o.value));
  const hiddenCount = options.length - visible.length;

  return (
    <div className="space-y-2 pt-2">
      {visible.map(({ value, label, count }) => (
        <div key={value} className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Checkbox
              id={`${idPrefix}-${value}`}
              checked={selected.includes(value)}
              onCheckedChange={() => onToggle(value)}
            />
            <label
              htmlFor={`${idPrefix}-${value}`}
              className="cursor-pointer select-none truncate text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </label>
          </div>
          {count != null && (
            <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground/70">
              {count}
            </span>
          )}
        </div>
      ))}

      {(hiddenCount > 0 || expanded) && options.length > limit && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex cursor-pointer items-center gap-1 text-[11px] font-bold text-primary transition-colors hover:text-tertiary-hover"
        >
          {expanded ? "Ver menos" : `Ver mais (${hiddenCount})`}
          <ChevronDown
            className={`size-3 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}

export function ProductTypeFilter() {
  return (
    <FilterSection title="Tipo de Produto">
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center gap-2">
          <Checkbox id="cards-only" checked />
          <label
            htmlFor="cards-only"
            className="text-xs font-medium text-foreground"
          >
            Apenas Cartas
          </label>
        </div>
        <div className="flex items-center gap-2 opacity-50">
          <Checkbox id="sealed-only" disabled />
          <span className="text-xs text-muted-foreground">Apenas Selados</span>
        </div>
      </div>
    </FilterSection>
  );
}

export function PriceRangeFilter({
  isPro,
  value,
  ceil,
  onChange,
  onUpsell,
}: {
  isPro: boolean;
  value: [number, number] | null;
  ceil: number;
  onChange: (v: [number, number]) => void;
  onUpsell: () => void;
}) {
  return (
    <FilterSection title="Faixa de Preço" badge="PRO">
      {isPro ? (
        <div className="space-y-2 pt-3">
          <Slider
            value={value ?? [0, ceil]}
            onValueChange={(v) => onChange(v as [number, number])}
            max={ceil}
            step={5}
            className="mx-auto w-full"
          />
          <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground">
            <span>R$ {(value?.[0] ?? 0).toFixed(0)}</span>
            <span>R$ {(value?.[1] ?? ceil).toFixed(0)}</span>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={onUpsell}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onUpsell();
            }
          }}
          className="block w-full cursor-pointer space-y-2 rounded pt-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <div className="pointer-events-none opacity-60">
            <Slider
              defaultValue={[25, 50]}
              max={100}
              step={5}
              className="mx-auto w-full"
            />
          </div>
          <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground">
            <span>R$ 25</span>
            <span>R$ 50</span>
          </div>
        </div>
      )}
    </FilterSection>
  );
}

export function LanguageFilter({
  isPro,
  value,
  onChange,
  onUpsell,
}: {
  isPro: boolean;
  value: string[];
  onChange: (v: string[]) => void;
  onUpsell: () => void;
}) {
  return (
    <FilterSection title="Idioma" badge="PRO">
      {isPro ? (
        <div className="space-y-2 pt-2">
          {FILTER_LANGUAGES.map((lang) => (
            <div key={lang.code} className="flex items-center gap-2">
              <Checkbox
                id={`lang-${lang.code}`}
                checked={value.includes(lang.code)}
                onCheckedChange={() =>
                  onChange(
                    value.includes(lang.code)
                      ? value.filter((x) => x !== lang.code)
                      : [...value, lang.code],
                  )
                }
              />
              <label
                htmlFor={`lang-${lang.code}`}
                className="cursor-pointer select-none text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                {lang.name}
              </label>
            </div>
          ))}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={onUpsell}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onUpsell();
            }
          }}
          className="block w-full cursor-pointer space-y-2 rounded pt-2 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {FILTER_LANGUAGES.map((lang) => (
            <div key={lang.code} className="flex items-center gap-2">
              <Checkbox id={`lang-${lang.code}`} disabled />
              <span className="text-xs font-medium text-muted-foreground">
                {lang.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </FilterSection>
  );
}
