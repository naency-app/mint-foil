"use client";

import { IconChevronDown } from "@tabler/icons-react";
import { type ReactNode, useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionLabel } from "@/components/ui/glass";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";

/**
 * Blocos da sidebar de filtros estilo marketplace (Explore, página de set…).
 * Os filtros PRO são funcionais para assinantes; para os demais são
 * decorativos e o clique chama onUpsell (abre o ProUpgradeModal).
 */

/**
 * Deriva facetas (valores + contagem) de uma característica das cartas —
 * raridade, tipo, atributo… Mais frequentes primeiro. Alimenta os filtros
 * dinâmicos que aparecem conforme a busca.
 */
export function facetOptions<T>(
  items: T[],
  getValue: (item: T) => string | null | undefined,
): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const v = getValue(item)?.trim();
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, count]) => ({ value, count }));
}

/**
 * Garante que o que está marcado continue na lista, com contagem 0. As
 * facetas contam com as OUTRAS escolhas aplicadas, então marcar FIRE pode
 * zerar uma raridade já marcada — sumindo da lista, não teria como desmarcar.
 */
export function comSelecionados(
  options: { value: string; count: number }[],
  selected: string[],
): { value: string; count: number }[] {
  const faltando = selected.filter((v) => !options.some((o) => o.value === v));
  return [...options, ...faltando.map((value) => ({ value, count: 0 }))];
}

/** Toggle imutável de um valor numa lista de selecionados. */
export function toggleValue(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((x) => x !== value)
    : [...list, value];
}

/**
 * Painel da sidebar de filtros: gruda no topo ao rolar a página e, mais alto
 * que a tela, rola por dentro. A rolagem fica numa caixa DENTRO do painel, com
 * as pontas esmaecidas: a lista some antes da borda em vez de ser cortada rente
 * a ela — com o painel translúcido, o corte rente parecia quebrado (19/10).
 *
 * O painel vai até 2rem da borda de baixo da tela (22/10: com 12rem sobrava
 * um vão vazio embaixo). No fim da página o aside termina antes do rodapé e o
 * sticky recua junto com ele — só ali, e é o rodapé entrando.
 */
export function PainelFiltros({ children }: { children: ReactNode }) {
  return (
    // O py do painel não rola: a caixa de rolagem termina 8px antes da borda.
    // A altura máxima fica no Root e o Viewport herda (o Viewport do Radix
    // usa height:100%, que não resolve contra um max-h de flex); o degradê
    // vai no Viewport para não apagar as pontas da barra.
    <div className="glass-card sticky top-20 py-2">
      <ScrollArea className="max-h-[calc(100vh-8rem)] *:data-[slot=scroll-area-viewport]:max-h-[inherit] *:data-[slot=scroll-area-viewport]:[mask-image:linear-gradient(to_bottom,transparent,black_12px,black_calc(100%-12px),transparent)]">
        <div className="space-y-5 px-4 py-2">{children}</div>
      </ScrollArea>
    </div>
  );
}

export function FilterSection({
  title,
  tag,
  children,
}: {
  title: string;
  /** Ao lado do título (ex.: a tag do tutorial de raridades). */
  tag?: ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <SectionLabel>{title}</SectionLabel>
        {tag}
      </div>
      {children}
    </div>
  );
}

/**
 * Lista de checkboxes com limite de itens visíveis — listas derivadas dos
 * dados (anos, raridades…) podem crescer muito; acima de `limit` entra o
 * "Ver mais/menos" pra sidebar não virar um paredão.
 *
 * Só recolhe se for esconder pelo menos `MIN_ESCONDIDOS`: um "Ver mais (2)"
 * não economiza espaço e ainda obriga a clicar para ver duas linhas (22/10).
 */
const MIN_ESCONDIDOS = 5;

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
  const recolhe = options.length - limit >= MIN_ESCONDIDOS;
  // Selecionados nunca somem ao recolher — senão o usuário perde de vista
  // um filtro ativo
  const visible =
    expanded || !recolhe
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
              className="cursor-pointer select-none truncate text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </label>
          </div>
          {count != null && (
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/70">
              {count}
            </span>
          )}
        </div>
      ))}

      {recolhe && (hiddenCount > 0 || expanded) && (
        <ShowMoreToggle
          expanded={expanded}
          hiddenCount={hiddenCount}
          onToggle={() => setExpanded((e) => !e)}
        />
      )}
    </div>
  );
}

/**
 * "Ver mais / Ver menos" da sidebar de filtros.
 *
 * Extraído porque a lista de jogos precisa do mesmo controle sem ser uma
 * `CheckboxFilterList` (ela mistura jogos ativos com os "Em breve", que são
 * desabilitados e têm badge). Um só lugar define a aparência do controle.
 */
export function ShowMoreToggle({
  expanded,
  hiddenCount,
  onToggle,
}: {
  expanded: boolean;
  hiddenCount: number;
  onToggle: () => void;
}) {
  return (
    // O anel de foco fica arredondado e com respiro: sem isso ele desenha um
    // retângulo colado no texto, e como o botão MUDA de posição ao recolher a
    // lista, o anel sobe junto e salta na cara. Mantido (e não removido) porque
    // é a única pista de onde se está ao navegar por teclado — e este botão
    // altera a lista inteira.
    <button
      type="button"
      onClick={onToggle}
      className="flex cursor-pointer items-center gap-1 rounded-md text-xs font-bold text-primary transition-colors hover:text-tertiary-hover focus-visible:outline-offset-2"
    >
      {expanded ? "Ver menos" : `Ver mais (${hiddenCount})`}
      <IconChevronDown
        className={`size-3 transition-transform ${expanded ? "rotate-180" : ""}`}
      />
    </button>
  );
}

export type ProductTypeValue = "single" | "sealed" | "all";

/**
 * Filtro de tipo de produto, agora funcional (backend tem Card.productType).
 * Dois checkboxes independentes → mapeiam para o param do back:
 *   cartas & !selados → single (padrão) · ambos → all · só selados → sealed.
 * Desmarcar os dois cai de volta em single (nunca esvazia o grid à toa).
 */
export function ProductTypeFilter({
  value = "single",
  onChange,
}: {
  value?: ProductTypeValue;
  onChange?: (v: ProductTypeValue) => void;
}) {
  const cards = value === "single" || value === "all";
  const sealed = value === "sealed" || value === "all";

  function resolve(nextCards: boolean, nextSealed: boolean): ProductTypeValue {
    if (nextCards && nextSealed) return "all";
    if (nextSealed) return "sealed";
    return "single";
  }

  return (
    <FilterSection title="Tipo de Produto">
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center gap-2">
          <Checkbox
            id="type-cards"
            checked={cards}
            onCheckedChange={() => onChange?.(resolve(!cards, sealed))}
          />
          <label
            htmlFor="type-cards"
            className="cursor-pointer text-sm font-medium text-foreground"
          >
            Apenas Cartas
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="type-sealed"
            checked={sealed}
            onCheckedChange={() => onChange?.(resolve(cards, !sealed))}
          />
          <label
            htmlFor="type-sealed"
            className="cursor-pointer select-none text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Produtos Selados
          </label>
        </div>
      </div>
    </FilterSection>
  );
}

/** Posições da barra: a escala é logarítmica (ver PriceRangeFilter). */
const PASSOS_DA_BARRA = 1000;

/** Arredonda para um número "redondo" da própria grandeza (12, 340, 5.600). */
function precoRedondo(v: number) {
  if (v < 100) return Math.round(v);
  const casa = 10 ** (Math.floor(Math.log10(v)) - 1);
  return Math.round(v / casa) * casa;
}

/**
 * Campo de valor embaixo da barra: digitar é mais rápido que acertar a barra
 * num catálogo que vai de centavos a milhão (pedido do usuário, 21/10). Só
 * aplica ao sair do campo ou no Enter, para não refazer a busca a cada tecla.
 */
function CampoPreco({
  rotulo,
  valor,
  onConfirmar,
}: {
  rotulo: string;
  valor: number;
  onConfirmar: (v: number) => void;
}) {
  const [texto, setTexto] = useState(String(valor));
  // A barra também muda o valor: o campo acompanha
  useEffect(() => setTexto(String(valor)), [valor]);

  function confirmar() {
    const n = Number(texto.replace(/\./g, "").replace(",", "."));
    if (Number.isFinite(n) && n >= 0) onConfirmar(n);
    else setTexto(String(valor));
  }

  return (
    <label className="glass-input flex h-9 min-w-0 flex-1 items-center gap-1.5 px-2.5 text-xs">
      {/* Sem "R$": a seção já é de preço, e a lateral é estreita demais para
          o símbolo e um valor de seis dígitos no mesmo campo */}
      <span className="shrink-0 text-muted-foreground">{rotulo}</span>
      <input
        inputMode="decimal"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={confirmar}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className="w-full min-w-0 bg-transparent font-medium tabular-nums text-foreground outline-none"
      />
    </label>
  );
}

export function PriceRangeFilter({
  value,
  ceil,
  onChange,
}: {
  value: [number, number] | null;
  ceil: number;
  onChange: (v: [number, number]) => void;
  /** Aceitos e ignorados: o filtro deixou de ser Pro. */
  isPro?: boolean;
  onUpsell?: () => void;
}) {
  /*
    Filtrar não é mais recurso premium. O que o Pro limita é o scan, que tem
    custo por uso; achar carta na própria coleção é o básico da ferramenta, e
    cobrar por isso só ensinava que ela trabalha contra quem ainda não paga.

    Escala logarítmica: o catálogo vai de centavos a grails de mais de R$ 1
    milhão. Linear, R$ 33.710 ficava a 3% da barra, colado no começo, e todo
    preço comum cabia no primeiro pixel (21/10). Em log cada casa decimal
    (R$ 1, 10, 100, 1.000…) ocupa um trecho igual da barra.
  */
  const log = Math.log1p(ceil);
  const posicao = (v: number) =>
    Math.round(
      (Math.log1p(Math.min(Math.max(v, 0), ceil)) / log) * PASSOS_DA_BARRA,
    );
  const preco = (p: number) =>
    p >= PASSOS_DA_BARRA
      ? ceil
      : precoRedondo(Math.expm1((p / PASSOS_DA_BARRA) * log));

  const [min, max] = value ?? [0, ceil];
  return (
    <FilterSection title="Faixa de Preço">
      <div className="space-y-2 pt-3">
        <Slider
          value={[posicao(min), posicao(max)]}
          onValueChange={([a, b]) => onChange([preco(a), preco(b)])}
          max={PASSOS_DA_BARRA}
          step={1}
          className="mx-auto w-full"
        />
        <div className="flex gap-2 pt-1">
          <CampoPreco
            rotulo="Mín"
            valor={min}
            onConfirmar={(v) => onChange([Math.min(v, max), max])}
          />
          <CampoPreco
            rotulo="Máx"
            valor={Math.min(max, ceil)}
            onConfirmar={(v) => onChange([min, Math.max(v, min)])}
          />
        </div>
      </div>
    </FilterSection>
  );
}
