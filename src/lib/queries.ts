"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";

import { api } from "./api";

/**
 * Hooks de dados compartilhados entre páginas (TanStack Query) — espelho de
 * mint-foil-app/lib/queries.ts.
 *
 * Chaves estáveis = cache compartilhado: Portfólio, Explore e a página da
 * carta pedem o MESMO ['portfolio-detail', id] — uma busca serve todas.
 * Mutações na coleção devem chamar useInvalidateCollection() para que toda
 * página dependente revalide sozinha.
 */

/**
 * Catálogo (cartas, coleções, TCGs, raridades) só muda quando um job do
 * scraper roda — no máximo uma vez por dia. Com o staleTime global de 60s,
 * trocar de página depois de um minuto refazia essas buscas à toa.
 * Dado de usuário NÃO usa isto: continua no padrão, revalidado por mutação.
 */
const CATALOGO_STALE_MS = 10 * 60_000;
export const queryKeys = {
  portfolios: ["portfolios"] as const,
  portfolioDetail: (id: string) => ["portfolio-detail", id] as const,
  history: (range: string, portfolioId?: string) =>
    ["collection-history", range, portfolioId ?? "all"] as const,
  stats: ["collection-stats"] as const,
  trending: (limit: number) => ["cards-trending", limit] as const,
  sets: (tcg?: string) => ["card-sets", tcg ?? "all"] as const,
  cards: (search?: string, tcg?: string, setId?: string) =>
    ["cards", search ?? "", tcg ?? "", setId ?? ""] as const,
  rarities: (tcg: string) => ["rarities", tcg] as const,
};

export function usePortfolios(enabled = true) {
  return useQuery({
    queryKey: queryKeys.portfolios,
    queryFn: () => api.collection.portfolios(),
    enabled,
    // Sem login o endpoint falha — não martelar o backend
    retry: false,
    // A lista de portfólios muda por ação do usuário (criar em outra tela) e é
    // pequena — sempre revalida ao montar, senão o Explore pega um cache velho
    // (ex.: vazio de antes de criar) e o "adicionar" não acha portfólio ativo.
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function usePortfolioDetail(portfolioId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.portfolioDetail(portfolioId ?? "none"),
    queryFn: () => api.collection.getPortfolio(portfolioId as string),
    enabled: !!portfolioId,
  });
}

export function useCollectionHistory(
  range: "7d" | "1m" | "3m" | "6m",
  portfolioId: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.history(range, portfolioId),
    queryFn: () => api.collection.history(range, portfolioId),
    enabled,
    // Trocar de range mantém a curva anterior na tela e o chart morfa
    // pra nova quando chega — sem sumiço nem layout shift
    placeholderData: keepPreviousData,
  });
}

export function useCollectionStats(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: () => api.collection.stats(),
    enabled,
  });
}

/** Perfil público (showcase) por handle — usado no "Ver como" do dono. */
/**
 * Descrição e links do próprio usuário.
 *
 * Endpoint separado do showcase de propósito: o showcase carrega a coleção
 * inteira, e o cabeçalho do dono precisa só de dois campos.
 */
export function useMyProfile(enabled: boolean) {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: () => api.users.profile(),
    enabled,
  });
}

export function useShowcase(handle: string, enabled: boolean) {
  return useQuery({
    queryKey: ["showcase", handle],
    queryFn: () => api.users.showcase(handle),
    enabled: enabled && !!handle,
  });
}

export function useCardDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["card", id ?? "none"],
    queryFn: () => api.cards.get(id as string),
    enabled: !!id,
    staleTime: CATALOGO_STALE_MS,
  });
}

export function useTcgs() {
  return useQuery({
    queryKey: ["tcgs"],
    queryFn: () => api.cards.tcgs(),
    staleTime: CATALOGO_STALE_MS,
  });
}

/**
 * Em quais portfólios do usuário esta carta está. Chave própria porque é dado
 * de usuário — entra no invalidateCollection junto com o resto.
 */
export function useCardOwnership(cardId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["card-ownership", cardId ?? "none"],
    queryFn: () => api.collection.itemsForCard(cardId as string),
    enabled: enabled && !!cardId,
    retry: false,
  });
}

/** Guia "Identifique sua raridade" — catálogo puro, muda só com a sync. */
export function useRarities(tcg: string | undefined) {
  return useQuery({
    queryKey: queryKeys.rarities(tcg ?? "none"),
    queryFn: () => api.cards.rarities(tcg as string),
    enabled: !!tcg,
    staleTime: CATALOGO_STALE_MS,
  });
}

export function useSetBySlug(
  tcgSlug: string | undefined,
  setSlug: string | undefined,
) {
  return useQuery({
    queryKey: ["set-by-slug", tcgSlug ?? "none", setSlug ?? "none"],
    queryFn: () => api.cards.setBySlug(tcgSlug as string, setSlug as string),
    enabled: !!tcgSlug && !!setSlug,
    staleTime: CATALOGO_STALE_MS,
  });
}

export function useTrendingCards(limit: number) {
  return useQuery({
    queryKey: queryKeys.trending(limit),
    queryFn: () => api.cards.trending(limit),
    staleTime: CATALOGO_STALE_MS,
  });
}

export function useCardSets(tcg?: string) {
  return useQuery({
    queryKey: queryKeys.sets(tcg),
    queryFn: () => api.cards.sets(tcg),
    staleTime: CATALOGO_STALE_MS,
  });
}

/**
 * Grid do Explore com scroll infinito.
 *
 * Uma página acabou quando o servidor devolve menos que `CARDS_PAGE_SIZE` — o
 * endpoint não retorna total, e pedir uma contagem seria uma query a mais por
 * rolagem. A ordenação do backend tem desempate por id, então a página 2 nunca
 * repete nem pula carta.
 *
 * Estado puro (sem busca/jogo/set) = descoberta → "Em Alta" real (maiores
 * variações do dia, ver adr/0002), que também pagina.
 */
export const CARDS_PAGE_SIZE = 60;

export function useInfiniteCards(
  search?: string,
  tcg?: string,
  setId?: string,
  productType?: "single" | "sealed" | "all",
) {
  const ehDescoberta =
    !setId && !search && !tcg && (!productType || productType === "single");

  return useInfiniteQuery({
    // Prefixo próprio: uma infinite query guarda `{ pages, pageParams }`, o
    // useCards guarda um array. Compartilhar a chave faria os dois brigarem
    // pelo mesmo slot do cache.
    queryKey: [
      "cards-infinite",
      ...queryKeys.cards(search, tcg, setId),
      productType ?? "single",
    ],
    queryFn: ({ pageParam = 0 }) => {
      const page = { limit: CARDS_PAGE_SIZE, offset: pageParam };
      if (setId)
        return api.cards.list(undefined, undefined, setId, productType, page);
      if (ehDescoberta) return api.cards.trending(CARDS_PAGE_SIZE, pageParam);
      return api.cards.list(
        search || undefined,
        tcg || undefined,
        undefined,
        productType,
        page,
      );
    },
    initialPageParam: 0,
    getNextPageParam: (ultima, todas) =>
      ultima.length < CARDS_PAGE_SIZE
        ? undefined
        : todas.reduce((n, p) => n + p.length, 0),
    staleTime: CATALOGO_STALE_MS,
  });
}

/**
 * Grid de cartas do Explore: busca / por jogo / por set.
 * Estado puro (sem busca/jogo/set) = descoberta → "Em Alta" real
 * (maiores variações do dia). Ver adr/0002.
 */
export function useCards(
  search?: string,
  tcg?: string,
  setId?: string,
  productType?: "single" | "sealed" | "all",
) {
  return useQuery({
    queryKey: [...queryKeys.cards(search, tcg, setId), productType ?? "single"],
    queryFn: () =>
      setId
        ? api.cards.list(undefined, undefined, setId, productType)
        : !search && !tcg && (!productType || productType === "single")
          ? api.cards.trending(60)
          : api.cards.list(
              search || undefined,
              tcg || undefined,
              undefined,
              productType,
            ),
    // Sem keepPreviousData de propósito: toda troca de contexto mostra
    // skeleton previsível em vez de conteúdo antigo sendo trocado "do nada"
    // (mesmo comportamento do resetGrid() do explore mobile). Voltar a um
    // filtro já visitado é instantâneo pelo cache (staleTime).
    staleTime: CATALOGO_STALE_MS,
  });
}

/** Invalida tudo que deriva da coleção — chamar após add/update/remove/copy/move. */
export function useInvalidateCollection() {
  const qc = useQueryClient();
  return useCallback(
    () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ["portfolios"] }),
        qc.invalidateQueries({ queryKey: ["portfolio-detail"] }),
        qc.invalidateQueries({ queryKey: ["collection-history"] }),
        qc.invalidateQueries({ queryKey: ["collection-stats"] }),
        qc.invalidateQueries({ queryKey: ["card-ownership"] }),
      ]),
    [qc],
  );
}
