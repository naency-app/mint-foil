"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { usePortfolioStore } from "@/lib/portfolio-store";
import { usePortfolios } from "@/lib/queries";

/**
 * Mantém o portfólio ativo (guardado no navegador) coerente com a conta logada.
 *
 * Duas situações faziam o "+" falhar com "Erro ao adicionar carta":
 * - trocar de conta no mesmo navegador: a conta nova herdava o portfólio da
 *   anterior, que não é dela;
 * - conta sem nenhum portfólio: as páginas só corrigem o ativo quando a lista
 *   tem algo, então o id antigo ficava lá.
 *
 * Num lugar só, no layout, em vez de repetir nas sete telas que escolhem o
 * portfólio. Não desenha nada.
 */
export function SincronizaPortfolio() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const sincronizarDono = usePortfolioStore((s) => s.sincronizarDono);
  const limparAtivo = usePortfolioStore((s) => s.limparAtivo);
  const activeId = usePortfolioStore((s) => s.activeId);
  const portfolios = usePortfolios(!!userId);

  useEffect(() => {
    if (userId) sincronizarDono(userId);
  }, [userId, sincronizarDono]);

  useEffect(() => {
    if (portfolios.data?.length === 0 && activeId) limparAtivo();
  }, [portfolios.data, activeId, limparAtivo]);

  return null;
}
