"use client";

import { api, type CollectionItem, type CollectionResponse, type PortfolioMetrics } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

const defaultMetrics: PortfolioMetrics = {
  totalInvested: 0,
  currentEstimatedValue: 0,
  profitOrLoss: 0,
  roi: 0,
};

export function useCollection() {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [metrics, setMetrics] = useState<PortfolioMetrics>(defaultMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollection = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data: CollectionResponse = await api.collection.get();
      setItems(data.items);
      setMetrics(data.metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar coleção");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const addItem = useCallback(
    async (data: { cardId: string; quantity: number; condition: string; buyPrice?: number }) => {
      await api.collection.add(data);
      await fetchCollection();
    },
    [fetchCollection],
  );

  const updateItem = useCallback(
    async (id: string, data: { quantity?: number; buyPrice?: number; notes?: string }) => {
      await api.collection.update(id, data);
      await fetchCollection();
    },
    [fetchCollection],
  );

  const removeItem = useCallback(
    async (id: string) => {
      await api.collection.remove(id);
      await fetchCollection();
    },
    [fetchCollection],
  );

  return { items, metrics, loading, error, addItem, updateItem, removeItem, refetch: fetchCollection };
}
