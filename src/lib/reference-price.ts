import type { PriceHistory } from "@/lib/api";

/** Fonte do preço internacional — igual a INTERNATIONAL_PRICE_SOURCE do backend. */
const INTERNATIONAL_PRICE_SOURCE = "TCGplayer";

type PricePoint = Pick<PriceHistory, "value" | "source" | "currency">;

/**
 * Série de referência: o preço internacional em real (TCGplayer convertido,
 * adr/0002) — a mesma regra do app (lib/reference-price.ts) e do backend
 * (pickReferencePrice).
 *
 * Os itens da coleção vêm com o histórico CRU: a cada dia entram dois pontos,
 * um em dólar e outro em real, com milissegundos de diferença. Pegar
 * `prices[0]` às vezes pegava o de dólar — o portfólio mostrava US$ 30.000
 * como "R$ 30.000,00" numa carta de R$ 156 mil, e o total da coleção
 * divergia do "Top cartas".
 */
export function referencePriceSeries<T extends PricePoint>(
  prices: T[] | null | undefined,
): T[] {
  return (prices ?? []).filter(
    (p) => p.source === INTERNATIONAL_PRICE_SOURCE && p.currency !== "USD",
  );
}

/** Preço de hoje em real (0 sem preço). */
export function precoAtual(prices: PricePoint[] | null | undefined): number {
  return referencePriceSeries(prices)[0]?.value ?? 0;
}

/** Preço do ponto anterior em real; sem ele, o de hoje (variação zero). */
export function precoAnterior(prices: PricePoint[] | null | undefined): number {
  const serie = referencePriceSeries(prices);
  return serie[1]?.value ?? serie[0]?.value ?? 0;
}
