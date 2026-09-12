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
  /** Capa de reserva (carta do set), usada quando `imageUrl` falha ao carregar */
  coverFallbackUrl?: string | null;
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

export interface RarityExample {
  rarity: string;
  count: number;
  imageUrl: string;
  exampleName: string | null;
  exampleCardId: string | null;
}

/**
 * Tamanhos derivados de `imageUrl`, calculados pela API (ver o interceptor
 * `card-images` no backend). Opcional porque backend antigo não manda — quem lê
 * cai no `imageUrl`, que é o comportamento de antes.
 */
export interface ImagensDaCarta {
  thumb: string;
  grid: string;
  full: string;
}

export interface Card {
  id: string;
  name: string;
  namePt?: string | null; // nome oficial em PT (BR): exibir quando houver
  setCode: string;
  setName: string | null;
  imageUrl: string;
  images?: ImagensDaCarta | null;
  rarity: string;
  attribute: string | null;
  cardType: string | null;
  description: string | null;
  atk: number | null;
  def: number | null;
  level: number | null;
  language: string;
  // SINGLE = carta avulsa; SEALED = produto selado (booster box, blister…)
  productType?: "SINGLE" | "SEALED";
  tcgId: string;
  tcg?: Tcg;
  set?: CardSet | null;
  createdAt: string;
  updatedAt: string;
  prices: PriceHistory[];
  /**
   * Último preço TCGplayer/BRL, denormalizado no banco — é por ele que o
   * catálogo ordena. Mesmo número que `prices[0].value`; existe como coluna
   * porque ordenar por uma relação 1-N não pagina.
   */
  latestPriceBrl?: number | null;
  storeLinks?: StoreLink[];
  internationalPrice?: InternationalPrice | null;
  storeBrowseLinks?: StoreBrowseLink[];
  collectorNumber?: string | null;
}

/**
 * Preço internacional (TCGplayer via TCGCSV) convertido USD→BRL.
 * Estimativa de mercado internacional — a UI mostra fonte, USD e câmbio.
 * Ver docs/adr/0002.
 */
export interface InternationalPrice {
  usd: number | null;
  brl: number;
  rate: number | null;
  source: string;
  updatedAt?: string;
}

/** Link de conferência "ver preço na loja" (sem valor embutido). */
export interface StoreBrowseLink {
  storeName: string;
  url: string;
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

export interface UserStats {
  memberSince: string | null;
  isPro: boolean;
  portfolioCount: number;
  totalCards: number;
  totalSealed: number;
  uniqueCards: number;
  totalValue: number;
  totalInvested: number;
  profitLoss: number;
  lifetimeScans: number;
  tcgBreakdown: { name: string; slug: string; value: number; count: number }[];
  topCards: {
    id: string;
    name: string;
    imageUrl: string;
    setCode: string;
    collectorNumber: string | null;
    quantity: number;
    unitValue: number;
    totalValue: number;
  }[];
}

/** Ordenações que o backend sabe executar. O resto do catálogo não é ordenável. */
export type CardSort =
  | "best-match"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"
  | "recent";

/**
 * Consulta do catálogo. Todo filtro daqui é resolvido NO BANCO, sobre o
 * catálogo inteiro — nada é refinado depois no cliente. Filtrar no cliente
 * sobre a página carregada fazia "Preço: maior → menor" devolver a carta mais
 * cara entre 60 cartas arbitrárias, não a mais cara do jogo.
 */
export interface CardQuery {
  search?: string;
  /** Um ou mais slugs de TCG, separados por vírgula. */
  tcg?: string;
  setId?: string;
  /** 'single' (padrão no back) esconde selados; 'sealed' só selados; 'all' tudo */
  productType?: "single" | "sealed" | "all";
  sort?: CardSort;
  /** Multi-seleção; viram CSV na query string. */
  rarity?: string[];
  cardType?: string[];
  attribute?: string[];
  minPrice?: number;
  maxPrice?: number;
  /** Scroll infinito: página de `limit` cartas a partir de `offset`. */
  limit?: number;
  offset?: number;
}

export interface FacetOption {
  value: string;
  count: number;
}

export interface CardFacets {
  rarity: FacetOption[];
  cardType: FacetOption[];
  attribute: FacetOption[];
  /** Maior preço do conjunto — teto do slider. */
  priceMax: number;
}

/**
 * `CardQuery` → query string. Um único lugar monta os parâmetros para o grid e
 * para as facetas: se os dois divergirem, as contagens passam a descrever um
 * conjunto diferente do que o grid mostra.
 */
function cardQueryParams(q: CardQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (q.search) params.set("search", q.search);
  if (q.tcg) params.set("tcg", q.tcg);
  if (q.setId) params.set("setId", q.setId);
  if (q.productType) params.set("productType", q.productType);
  // "best-match" é a ordem natural do backend — mandar seria ruído na URL.
  if (q.sort && q.sort !== "best-match") params.set("sort", q.sort);
  if (q.rarity?.length) params.set("rarity", q.rarity.join(","));
  if (q.cardType?.length) params.set("cardType", q.cardType.join(","));
  if (q.attribute?.length) params.set("attribute", q.attribute.join(","));
  if (q.minPrice !== undefined) params.set("minPrice", String(q.minPrice));
  if (q.maxPrice !== undefined) params.set("maxPrice", String(q.maxPrice));
  if (q.limit) params.set("limit", String(q.limit));
  if (q.offset) params.set("offset", String(q.offset));
  return params;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
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
  users: {
    /** Perfil público (showcase) por handle — usado no "Ver como" do dono. */
    showcase: (handle: string) =>
      apiFetch<import("./showcase").Showcase>(
        `/users/showcase/${encodeURIComponent(handle)}`,
      ),
    /** Disponibilidade/validade de um @handle (para o formulário, com debounce). */
    checkHandle: (handle: string) =>
      apiFetch<{ handle: string; available: boolean; reason?: string }>(
        `/users/handle/check?handle=${encodeURIComponent(handle)}`,
      ),
    /** Troca o @handle (1ª grátis, depois Pro → erro HANDLE_EDIT_REQUIRES_PRO). */
    updateHandle: (handle: string) =>
      apiFetch<{ handle: string; handleEditCount: number; isPro: boolean }>(
        "/users/handle",
        { method: "POST", body: JSON.stringify({ handle }) },
      ),
    /** Fundo do perfil (gradient | color | preset | image). */
    updateCover: (
      type: "gradient" | "color" | "preset" | "image",
      value?: string | null,
    ) =>
      apiFetch<{ type: string; value: string | null }>("/users/cover", {
        method: "POST",
        body: JSON.stringify({ type, value }),
      }),
    /** Descrição e links do próprio usuário (leve — não traz a coleção). */
    profile: () =>
      apiFetch<{ bio: string | null; socials: Record<string, string> }>(
        "/users/profile",
      ),
    /** Descrição e links do perfil público. Campo omitido fica como está. */
    updateProfile: (input: {
      bio?: string | null;
      socials?: Record<string, string>;
    }) =>
      apiFetch<{ bio: string | null; socials: Record<string, string> }>(
        "/users/profile",
        { method: "POST", body: JSON.stringify(input) },
      ),
  },
  cards: {
    list: (query: CardQuery = {}) => {
      const qs = cardQueryParams(query).toString();
      return apiFetch<Card[]>(`/cards${qs ? `?${qs}` : ""}`);
    },
    /**
     * Opções de filtro do conjunto atual, com contagem, e o teto de preço.
     * Vem do backend porque só ele enxerga o catálogo inteiro — derivar isso
     * das cartas já carregadas descrevia uma amostra de 60.
     */
    facets: (query: CardQuery = {}) => {
      const qs = cardQueryParams({
        ...query,
        limit: undefined,
        offset: undefined,
      }).toString();
      return apiFetch<CardFacets>(`/cards/facets${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => apiFetch<Card>(`/cards/${id}`),
    /** Raridades de um TCG com carta de exemplo — guia "Identifique sua raridade" */
    rarities: (tcg: string) =>
      apiFetch<RarityExample[]>(
        `/cards/rarities?tcg=${encodeURIComponent(tcg)}`,
      ),
    /** Maiores variações do dia na série internacional (ver adr/0002) */
    trending: (limit?: number, offset?: number) => {
      const params = new URLSearchParams();
      if (limit) params.set("limit", String(limit));
      if (offset) params.set("offset", String(offset));
      const qs = params.toString();
      return apiFetch<Card[]>(`/cards/trending${qs ? `?${qs}` : ""}`);
    },
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
    updatePortfolio: (id: string, name: string) =>
      apiFetch<Portfolio>(`/collection/portfolios/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      }),
    deletePortfolio: (id: string) =>
      apiFetch<void>(`/collection/portfolios/${id}`, {
        method: "DELETE",
      }),
    getPortfolio: (id: string) =>
      apiFetch<CollectionResponse & { portfolio: Portfolio }>(
        `/collection/portfolios/${id}`,
      ),
    /**
     * Em quais portfólios uma carta está. Uma requisição no lugar de baixar o
     * conteúdo completo de cada portfólio só para filtrar um item.
     */
    itemsForCard: (cardId: string) =>
      apiFetch<
        Pick<
          CollectionItem,
          | "id"
          | "quantity"
          | "condition"
          | "buyPrice"
          | "notes"
          | "cardId"
          | "portfolioId"
        >[]
      >(`/collection/items?cardId=${encodeURIComponent(cardId)}`),
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
    stats: () => apiFetch<UserStats>("/collection/stats"),
    history: (range: "7d" | "1m" | "3m" | "6m", portfolioId?: string) =>
      apiFetch<{ date: string; value: number }[]>(
        `/collection/history?range=${range}${portfolioId ? `&portfolioId=${portfolioId}` : ""}`,
      ),
  },
  scan: {
    remaining: () =>
      apiFetch<{ remaining: number; requiresAuth?: boolean }>(
        "/scan/remaining",
      ),
    identify: async (
      imageBase64: string,
    ): Promise<
      | { ok: true; cardName: string }
      | { ok: false; status: number; message: string }
    > => {
      const res = await fetch(`${API_URL}/scan/identify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) return { ok: true, cardName: body.cardName };
      return {
        ok: false,
        status: res.status,
        message: body.message || `Erro ${res.status}`,
      };
    },
  },
};
