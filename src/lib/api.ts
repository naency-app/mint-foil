import type { CartaDaTroca } from "@/lib/troca";

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
  /**
   * As 3 cartas mais valiosas do set, da mais cara para a menos. Viram a capa
   * quando o logo não existe. Opcional porque backend antigo não manda.
   */
  coverCards?: {
    imageUrl: string;
    images?: { thumb: string; grid: string; full: string } | null;
  }[];
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
  /** false = a TCGplayer não tem foto desta carta (a URL dá 403) */
  hasImage?: boolean;
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
  precoMyp?: PrecoMyp | null;
  storeBrowseLinks?: StoreBrowseLink[];
  collectorNumber?: string | null;
}

/**
 * Preço internacional (TCGplayer via TCGCSV) convertido USD→BRL.
 * Estimativa de mercado internacional — a UI mostra fonte, USD e câmbio.
 * Ver docs/adr/0002.
 */
/**
 * Preço da MyP Cards (API oficial): `menor` é o valor da carta — o menor preço
 * anunciado. null = sem oferta, sem ligação com o catálogo ou sem a integração.
 * A MyP exige a atribuição visível onde o dado aparece.
 */
export interface PrecoMyp {
  menor: number;
  medio: number | null;
  /** O anúncio mais caro: com o menor, vira a faixa "de R$ X a R$ Y" */
  maior: number | null;
  aVenda: number | null;
  link: string;
  atualizadoEm: string;
}

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
  | "pct-asc"
  | "pct-desc"
  | "rise"
  | "drop"
  | "name-asc"
  | "name-desc"
  | "oldest"
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

/** Autocomplete da busca — GET /cards/sugestoes. */
export interface SugestoesBusca {
  /** Nomes-base (sem o printing), em PT quando há; escolher busca por ele. */
  nomes: {
    nome: string;
    tcg: string;
    tcgNome: string;
    imageUrl: string;
    images?: { thumb: string; grid: string; full: string } | null;
    impressoes: number;
  }[];
  colecoes: {
    id: string;
    name: string;
    slug: string;
    code: string;
    imageUrl: string | null;
    coverFallbackUrl: string | null;
    totalCards: number | null;
    tcg: { slug: string; name: string };
    /** As 3 cartas mais valiosas, para o leque (backend de 24/10 em diante). */
    coverCards?: {
      imageUrl: string;
      images?: { thumb: string; grid: string; full: string } | null;
    }[];
  }[];
  /** Só com número no termo: a carta exata pelo código. */
  cartas: {
    id: string;
    name: string;
    namePt: string | null;
    imageUrl: string;
    images?: { thumb: string; grid: string; full: string } | null;
    collectorNumber: string | null;
    setName: string | null;
    latestPriceBrl: number | null;
    /** Menor preço da MyP (ausente em backend antigo ou carta sem MyP) */
    mypMenor?: number | null;
    tcg: { slug: string; name: string };
  }[];
  /**
   * Produtos selados que casam com o termo (booster box, ETB, lata), até 3.
   * Ausente em backend antigo (30/10).
   */
  selados?: SugestoesBusca["cartas"];
}

/**
 * O preço de uma carta da busca: o da MyP quando ela tem a carta, senão o
 * internacional. É o mesmo que a tela da carta mostra em destaque (30/10).
 */
export function precoDaSugestao(carta: {
  latestPriceBrl?: number | null;
  mypMenor?: number | null;
}): number | null {
  return carta.mypMenor ?? carta.latestPriceBrl ?? null;
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

// ─── Social (seguir, pedidos, bloquear) — espelho de mint-foil-app/lib/api.ts ──

/** Relação de quem vê com o perfil: 'self' é o próprio perfil. */
export type FollowStatus = "self" | "none" | "requested" | "following";

export interface FollowUser {
  id?: string;
  handle: string;
  displayName: string;
  image: string | null;
  isPro: boolean;
  followStatus?: FollowStatus;
}

/** Conta que eu bloqueei (Ajustes → Contas bloqueadas). */
export interface BlockedUser {
  handle: string;
  displayName: string;
  image: string | null;
  isPro: boolean;
  blockedAt: string;
}

/** Tipos de aviso da caixa de notificações (o mesmo do app). */
export type NotificationType =
  | "NEW_FOLLOWER"
  | "FOLLOW_REQUEST"
  | "FOLLOW_ACCEPTED"
  | "PRICE_ALERT"
  | "PRICE_RISE"
  | "ANNOUNCEMENT";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** Contexto para navegar/desenhar: cardId + imageUrl, handle + image, url. */
  data: {
    cardId?: string;
    cardIds?: string[];
    imageUrl?: string;
    images?: { thumb: string; grid: string; full: string };
    handle?: string;
    image?: string | null;
    url?: string;
  } | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPage {
  items: AppNotification[];
  nextCursor: string | null;
}

export interface FollowRequest {
  id: string;
  user: {
    handle: string;
    displayName: string;
    image: string | null;
    isPro: boolean;
  };
}

export type ReportReason =
  | "SPAM"
  | "OFFENSIVE"
  | "IMPERSONATION"
  | "SCAM"
  | "OTHER";

/**
 * Erro da API com o status HTTP junto.
 *
 * Sem o status, quem chama só tem a mensagem — e "Erro ao adicionar carta" é a
 * mesma frase para sessão expirada (401) e para banco fora do ar. A tela precisa
 * distinguir: no 401 a saída é entrar de novo, não tentar de novo.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Frase que a pessoa lê quando o backend não manda uma em português.
 *
 * Antes a tela mostrava o que viesse: "Failed to fetch" com a internet caída,
 * "Card with ID … not found" no link quebrado, "API error: 503" com o servidor
 * acordando. Status 0 = a requisição nem chegou ao servidor.
 */
function mensagemPorStatus(status: number): string {
  if (status === 0)
    return "Não foi possível conectar ao Mint Foil. Confira sua internet e tente de novo.";
  if (status === 401)
    return "Sua sessão expirou. Entre de novo para continuar.";
  if (status === 403) return "Você não tem permissão para fazer isso.";
  if (status === 404) return "Não encontramos o que você procurou.";
  if (status === 429)
    return "Muitas tentativas seguidas. Espere um pouco e tente de novo.";
  if (status >= 500)
    return "O servidor não respondeu como devia. Tente de novo em instantes.";
  return "Algo deu errado. Tente de novo.";
}

/**
 * Os erros de regra do backend já vêm em português e dizem o que fazer ("Esse
 * nome de usuário já está em uso."), então passam como estão. Os padrões do
 * Nest ("Not Found"), os da validação (lista de frases em inglês) e alguns
 * antigos ("Portfolio not found") não — esses viram a frase do status.
 */
const EM_INGLES =
  /\b(not found|unauthorized|forbidden|bad request|internal server error|too many requests|failed|missing|invalid|must|should|error)\b/i;

function mensagemDoErro(body: { message?: unknown }, status: number): string {
  const m = body.message;
  if (typeof m === "string" && m.trim() && !EM_INGLES.test(m)) return m;
  return mensagemPorStatus(status);
}

/**
 * Texto de um erro qualquer pego num `catch` — para quem fala com o backend sem
 * passar pelo `apiFetch` (o cliente do better-auth: nome, exclusão de conta).
 * Sem rede, o navegador lança TypeError com a frase dele ("Failed to fetch" no
 * Chrome, "Load failed" no Safari, "NetworkError…" no Firefox).
 */
export function textoDoErro(e: unknown, padrao: string): string {
  if (e instanceof ApiError) return e.message;
  // Fora a falta de rede, TypeError é bug nosso: a frase do motor não ajuda
  if (e instanceof TypeError)
    return /fetch|load failed|network/i.test(e.message)
      ? mensagemPorStatus(0)
      : padrao;
  if (e instanceof Error && e.message && !EM_INGLES.test(e.message))
    return e.message;
  return padrao;
}

/** Um dia do histórico da MYP. */
export interface PontoMyp {
  /** AAAA-MM-DD */
  data: string;
  menor: number | null;
  mediana: number | null;
}

/** Histórico de 90 dias da MYP de uma carta (GET /myp/historico/:cardId). */
export interface HistoricoMyp {
  /** De qual versão a série é ("Normal · NM · English") */
  versao: string | null;
  pontos: PontoMyp[];
  atualizadoEm: string;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...options?.headers,
      },
    });
  } catch (erro) {
    // Cancelamento (troca de filtro no meio da busca) não é falha: o TanStack
    // precisa ver o AbortError para descartar a resposta em silêncio.
    if (erro instanceof DOMException && erro.name === "AbortError") throw erro;
    throw new ApiError(mensagemPorStatus(0), 0);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(mensagemDoErro(body, res.status), res.status);
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
    /** Foto de perfil própria, em base64 (o servidor reprocessa e guarda no R2). */
    setAvatar: (image: string) =>
      apiFetch<{ image: string }>("/users/avatar", {
        method: "POST",
        body: JSON.stringify({ image }),
      }),
    /** Volta para a foto do login (ou as iniciais). */
    removeAvatar: () =>
      apiFetch<{ image: null }>("/users/avatar", { method: "DELETE" }),
  },
  notifications: {
    list: (cursor?: string) =>
      apiFetch<NotificationPage>(
        `/notifications${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`,
      ),
    unreadCount: () =>
      apiFetch<{ count: number }>("/notifications/unread-count"),
    /** Sem ids, marca todas como lidas. */
    markRead: (ids?: string[]) =>
      apiFetch<{ updated: number }>("/notifications/read", {
        method: "POST",
        body: JSON.stringify(ids?.length ? { ids } : {}),
      }),
    /** Apaga um aviso; sem id, limpa a caixa inteira. */
    remove: (id?: string) =>
      apiFetch<{ deleted: number }>(
        `/notifications${id ? `/${encodeURIComponent(id)}` : ""}`,
        { method: "DELETE" },
      ),
  },
  follows: {
    /** Busca de contas por @ ou nome (exclui anônimos e o próprio). */
    search: (q: string) =>
      apiFetch<FollowUser[]>(`/users/search?q=${encodeURIComponent(q)}`),
    follow: (handle: string) =>
      apiFetch<{ status: FollowStatus }>(
        `/follows/${encodeURIComponent(handle)}`,
        { method: "POST" },
      ),
    unfollow: (handle: string) =>
      apiFetch<{ status: FollowStatus }>(
        `/follows/${encodeURIComponent(handle)}`,
        { method: "DELETE" },
      ),
    counts: () =>
      apiFetch<{ followers: number; following: number }>("/follows/counts"),
    requests: () => apiFetch<FollowRequest[]>("/follows/requests"),
    accept: (id: string) =>
      apiFetch<{ ok: boolean }>(`/follows/requests/${id}/accept`, {
        method: "POST",
      }),
    reject: (id: string) =>
      apiFetch<{ ok: boolean }>(`/follows/requests/${id}/reject`, {
        method: "POST",
      }),
    followers: (handle: string) =>
      apiFetch<FollowUser[]>(
        `/follows/${encodeURIComponent(handle)}/followers`,
      ),
    following: (handle: string) =>
      apiFetch<FollowUser[]>(
        `/follows/${encodeURIComponent(handle)}/following`,
      ),
  },
  /** Bloquear e denunciar (exigência das lojas para perfil público). */
  moderation: {
    blocks: () => apiFetch<BlockedUser[]>("/blocks"),
    block: (handle: string) =>
      apiFetch<{ blocked: boolean }>(`/blocks/${encodeURIComponent(handle)}`, {
        method: "POST",
      }),
    unblock: (handle: string) =>
      apiFetch<{ blocked: boolean }>(`/blocks/${encodeURIComponent(handle)}`, {
        method: "DELETE",
      }),
    report: (handle: string, reason: ReportReason, details?: string) =>
      apiFetch<{ ok: boolean }>(`/reports/${encodeURIComponent(handle)}`, {
        method: "POST",
        body: JSON.stringify({ reason, details }),
      }),
  },
  myp: {
    /**
     * Histórico de 90 dias da MYP Cards (menor preço e mediana por dia, em
     * reais) do gráfico "Em real" da carta. `null` quando a carta não tem na
     * MYP; o gráfico abre na aba Internacional.
     */
    historico: (cardId: string) =>
      apiFetch<HistoricoMyp | null>(`/myp/historico/${encodeURIComponent(cardId)}`),
  },
  cards: {
    /**
     * Busca do Explorar restrita a estas cartas (portfólio, perfil público):
     * devolve os ids que casam, com o mesmo motor do catálogo.
     */
    searchIn: (search: string, cardIds: string[]) =>
      apiFetch<{ cardIds: string[] }>("/cards/search-in", {
        method: "POST",
        body: JSON.stringify({ search, cardIds }),
      }),
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
    /** Autocomplete da busca: nomes, coleções e a carta exata pelo código. */
    sugestoes: (q: string, tcg?: string) => {
      const qs = new URLSearchParams({ q });
      if (tcg) qs.set("tcg", tcg);
      return apiFetch<SugestoesBusca>(`/cards/sugestoes?${qs}`);
    },
    get: (id: string) => apiFetch<Card>(`/cards/${id}`),
    /** Várias cartas por id, na ordem pedida: abre um link de troca (30/10). */
    lote: (ids: string[]) =>
      apiFetch<CartaDaTroca[]>(
        `/cards/lote?ids=${encodeURIComponent(ids.join(","))}`,
      ),
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
    /**
     * Confirma uma troca: os itens dados saem do portfólio e as cartas
     * recebidas entram no `portfolioId`. Tudo ou nada (30/10).
     */
    confirmarTroca: (dados: {
      dar: { itemId: string; quantidade: number }[];
      receber: { cardId: string; quantidade: number }[];
      portfolioId?: string;
    }) =>
      apiFetch<{ dados: number; recebidos: number }>("/collection/troca", {
        method: "POST",
        body: JSON.stringify(dados),
      }),
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
};
