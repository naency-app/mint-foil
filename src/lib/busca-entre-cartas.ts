"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

/** Hash curto da lista de ids, para a chave do cache não carregar mil ids. */
function hashIds(ids: string[]): string {
  let h = 5381;
  for (const id of ids)
    for (let i = 0; i < id.length; i++)
      h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  return `${ids.length}:${h >>> 0}`;
}

/**
 * Busca do Explorar dentro de uma lista de cartas — a mesma do catálogo, que
 * acha "op10102", código misturado com nome e erro de digitação. Espelho de
 * mint-foil-app/lib/busca-entre-cartas.ts.
 *
 * Devolve os ids que casam, ou `null` sem resposta (sem termo, digitando, sem
 * rede). Quem usa junta com o filtro local (`cartaCasaBusca`), que responde na
 * hora e cobre coleção e raridade.
 */
export function useBuscaEntreCartas(
  termo: string,
  cardIds: string[],
): Set<string> | null {
  const [adiado, setAdiado] = useState(termo.trim());
  useEffect(() => {
    const t = setTimeout(() => setAdiado(termo.trim()), 250);
    return () => clearTimeout(t);
  }, [termo]);

  const ids = useMemo(() => [...new Set(cardIds)], [cardIds]);
  const chave = useMemo(() => hashIds(ids), [ids]);

  const { data } = useQuery({
    queryKey: ["busca-entre-cartas", adiado.toLowerCase(), chave],
    queryFn: () =>
      api.cards.searchIn(adiado, ids).then((r) => new Set(r.cardIds)),
    enabled: adiado.length > 0 && ids.length > 0,
    staleTime: 60_000,
    retry: 0,
  });

  return adiado === termo.trim() && data ? data : null;
}
