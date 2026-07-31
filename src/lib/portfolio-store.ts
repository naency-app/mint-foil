import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Portfolio } from "@/lib/api";

/** Chaves da implementação anterior, lidas uma única vez na migração. */
const LEGACY_FAVORITES_KEY = "minty_favorite_portfolio_ids";
const LEGACY_DEFAULT_KEY = "minty_default_portfolio_id";

interface PortfolioState {
  /** Último portfólio escolhido explicitamente pelo usuário. */
  activeId: string | null;
  /** Portfólios fixados: aparecem primeiro e ganham a escolha automática. */
  favoriteIds: string[];
  setActive: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

/**
 * Contexto de portfólio compartilhado por todas as telas.
 *
 * Antes cada página relia o localStorage por conta própria e a seleção manual
 * não era gravada em lugar nenhum — ao abrir uma carta e voltar, a página
 * remontava e o portfólio caía no favorito ou no primeiro da lista, perdendo
 * onde o usuário estava. Aqui a escolha é estado global e persistido.
 */
export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      activeId: null,
      favoriteIds: [],
      setActive: (id) => set({ activeId: id }),
      toggleFavorite: (id) =>
        set((s) => ({
          favoriteIds: s.favoriteIds.includes(id)
            ? s.favoriteIds.filter((f) => f !== id)
            : [...s.favoriteIds, id],
        })),
    }),
    {
      name: "minty-portfolio",
      // Quem já usava o app tem favoritos gravados no formato antigo; sem isto
      // eles perderiam os portfólios fixados na primeira visita após o deploy.
      merge: (persisted, current) => {
        const salvo = (persisted ?? {}) as Partial<PortfolioState>;
        if (salvo.favoriteIds?.length || typeof window === "undefined") {
          return { ...current, ...salvo };
        }

        let legados: string[] = [];
        const brutos = localStorage.getItem(LEGACY_FAVORITES_KEY);
        if (brutos) {
          try {
            legados = JSON.parse(brutos) as string[];
          } catch {}
        } else {
          const antigo = localStorage.getItem(LEGACY_DEFAULT_KEY);
          if (antigo) legados = [antigo];
        }

        return {
          ...current,
          ...salvo,
          favoriteIds: legados,
          activeId: salvo.activeId ?? localStorage.getItem(LEGACY_DEFAULT_KEY),
        };
      },
    },
  ),
);

/**
 * Qual portfólio abrir, dada a lista disponível. A ordem importa: a escolha
 * explícita do usuário vence a preferência declarada, que vence o palpite.
 */
export function resolveActiveId(
  portfolios: Portfolio[],
  activeId: string | null,
  favoriteIds: string[],
): string | null {
  if (portfolios.length === 0) return null;
  if (activeId && portfolios.some((p) => p.id === activeId)) return activeId;
  const favorito = portfolios.find((p) => favoriteIds.includes(p.id));
  return favorito?.id ?? portfolios[0].id;
}

/** Favoritos primeiro, preservando a ordem do servidor dentro de cada grupo. */
export function sortByFavorite(
  portfolios: Portfolio[],
  favoriteIds: string[],
): Portfolio[] {
  return [...portfolios].sort((a, b) => {
    const aFav = favoriteIds.includes(a.id);
    const bFav = favoriteIds.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });
}
