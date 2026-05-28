"use client";

import { api, type Card } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

export function useCards(initialSearch?: string) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch ?? "");

  const fetchCards = useCallback(async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.cards.list(query);
      setCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar cartas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards(search || undefined);
  }, [fetchCards, search]);

  return { cards, loading, error, search, setSearch, refetch: fetchCards };
}

export function useCard(id: string) {
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.cards.get(id);
        if (!cancelled) setCard(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Erro ao buscar carta");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { card, loading, error };
}
