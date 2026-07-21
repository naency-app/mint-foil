"use client";

import {
  keepPreviousData,
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
};

export function usePortfolios(enabled = true) {
  return useQuery({
    queryKey: queryKeys.portfolios,
    queryFn: () => api.collection.portfolios(),
    enabled,
    // Sem login o endpoint falha — não martelar o backend
    retry: false,
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

export function useCardDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["card", id ?? "none"],
    queryFn: () => api.cards.get(id as string),
    enabled: !!id,
  });
}

export function useTcgs() {
  return useQuery({
    queryKey: ["tcgs"],
    queryFn: () => api.cards.tcgs(),
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
  });
}

export function useTrendingCards(limit: number) {
  return useQuery({
    queryKey: queryKeys.trending(limit),
    queryFn: () => api.cards.trending(limit),
  });
}

export function useCardSets(tcg?: string) {
  return useQuery({
    queryKey: queryKeys.sets(tcg),
    queryFn: () => api.cards.sets(tcg),
  });
}

/**
 * Grid de cartas do Explore: busca / por jogo / por set.
 * Estado puro (sem busca/jogo/set) = descoberta → "Em Alta" real
 * (maiores variações do dia). Ver adr/0002.
 */
export function useCards(search?: string, tcg?: string, setId?: string) {
  return useQuery({
    queryKey: queryKeys.cards(search, tcg, setId),
    queryFn: () =>
      setId
        ? api.cards.list(undefined, undefined, setId)
        : !search && !tcg
          ? api.cards.trending(60)
          : api.cards.list(search || undefined, tcg || undefined),
    // Sem keepPreviousData de propósito: toda troca de contexto mostra
    // skeleton previsível em vez de conteúdo antigo sendo trocado "do nada"
    // (mesmo comportamento do resetGrid() do explore mobile). Voltar a um
    // filtro já visitado é instantâneo pelo cache (staleTime).
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
      ]),
    [qc],
  );
}
