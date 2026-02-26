const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export interface Tcg {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  _count?: { cards: number };
}

export interface CardSet {
  id: string;
  code: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  releaseDate: string | null;
  totalCards: number | null;
  tcgId: string;
  tcg?: Tcg;
  _count?: { cards: number };
}

export interface PriceHistory {
  id: string;
  value: number;
  currency: string;
  source: string;
  condition: string;
  createdAt: string;
  cardId: string;
}

export interface StoreLink {
  id: string;
  storeName: string;
  storeUrl: string;
  price: number | null;
  inStock: boolean;
  cardId: string;
}

export interface Card {
  id: string;
  name: string;
  setCode: string;
  setName: string | null;
  imageUrl: string;
  rarity: string;
  attribute: string | null;
  cardType: string | null;
  description: string | null;
  atk: number | null;
  def: number | null;
  level: number | null;
  language: string;
  tcgId: string;
  tcg?: Tcg;
  set?: CardSet | null;
  createdAt: string;
  updatedAt: string;
  prices: PriceHistory[];
  storeLinks?: StoreLink[];
}

export interface Portfolio {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { items: number };
}

export interface CollectionItem {
  id: string;
  quantity: number;
  condition: string;
  buyPrice: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  portfolioId: string;
  cardId: string;
  card: Card;
}

export interface PortfolioMetrics {
  totalInvested: number;
  currentEstimatedValue: number;
  profitOrLoss: number;
  roi: number;
}

export interface CollectionResponse {
  metrics: PortfolioMetrics;
  items: CollectionItem[];
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  cards: {
    list: (search?: string, tcg?: string, setId?: string) => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (tcg) params.set("tcg", tcg);
      if (setId) params.set("setId", setId);
      const qs = params.toString();
      return apiFetch<Card[]>(`/cards${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => apiFetch<Card>(`/cards/${id}`),
    tcgs: () => apiFetch<Tcg[]>("/cards/tcgs"),
    sets: (tcg?: string) => {
      const qs = tcg ? `?tcg=${encodeURIComponent(tcg)}` : "";
      return apiFetch<CardSet[]>(`/cards/sets${qs}`);
    },
    setBySlug: (tcgSlug: string, setSlug: string) =>
      apiFetch<CardSet>(`/cards/sets/${tcgSlug}/${setSlug}`),
  },
  collection: {
    get: () => apiFetch<CollectionResponse>("/collection"),
    portfolios: () => apiFetch<Portfolio[]>("/collection/portfolios"),
    createPortfolio: (name: string) =>
      apiFetch<Portfolio>("/collection/portfolios", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    getPortfolio: (id: string) =>
      apiFetch<CollectionResponse & { portfolio: Portfolio }>(
        `/collection/portfolios/${id}`,
      ),
    add: (data: {
      cardId: string;
      quantity: number;
      condition: string;
      buyPrice?: number;
      notes?: string;
      portfolioId?: string;
    }) =>
      apiFetch<CollectionItem>("/collection", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (
      id: string,
      data: { quantity?: number; buyPrice?: number; notes?: string },
    ) =>
      apiFetch<CollectionItem>(`/collection/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      apiFetch<CollectionItem>(`/collection/${id}`, { method: "DELETE" }),
  },
};
