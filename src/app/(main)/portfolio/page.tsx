"use client";

import {
  IconArrowRight as ArrowRight,
  IconArrowsUpDown as ArrowUpDown,
  IconCheck as Check,
  IconChevronLeft as ChevronLeft,
  IconCopy as Copy,
  IconFileSpreadsheet as FileSpreadsheet,
  IconFolderPlus as FolderPlus,
  IconEye,
  IconEyeCancel,
  IconShare2,
  IconLoader2 as Loader2,
  IconPackage as Package,
  IconPlus as Plus,
  IconScan as ScanLine,
  IconSearch as Search,
  IconSparkles as Sparkles,
  IconTrash as Trash2,
  IconTrendingDown as TrendingDown,
  IconTrendingUp as TrendingUp,
  IconX as X,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ShowcaseBrowser } from "@/app/(main)/showcase/profile/[handle]/showcase-browser";
import { AddToPortfolioButton } from "@/app/components/AddToPortfolioButton";
import { CardImage } from "@/app/components/CardImage";
import { CollectionInsights } from "@/app/components/CollectionInsights";
import { ConviteAppFaixa } from "@/app/components/ConviteApp";
import {
  BotaoNovoPortfolio,
  DialogoNovoPortfolio,
} from "@/app/components/DialogoNovoPortfolio";
import {
  CheckboxFilterList,
  FilterSection,
  facetOptions,
  PainelFiltros,
  PriceRangeFilter,
  type ProductTypeValue,
  toggleValue,
} from "@/app/components/filters";
import { PortfolioSelector } from "@/app/components/PortfolioSelector";
import { ProfileHeader } from "@/app/components/ProfileHeader";
import { ProUpgradeModal } from "@/app/components/ProUpgradeModal";
import { RollingCounter } from "@/app/components/RollingCounter";
import { AdicionarAmigos } from "@/app/components/social/AdicionarAmigos";
import { PedidosButton } from "@/app/components/social/PedidosButton";
import { SocialStats } from "@/app/components/social/SocialStats";
import { AlternarTipoDeProduto } from "@/components/AlternarTipoDeProduto";
import { AlternarVisao } from "@/components/AlternarVisao";
import { Area } from "@/components/charts/area";
import { AreaChart } from "@/components/charts/area-chart";
import Grid from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { EstadoVazio } from "@/components/EstadoVazio";
import { Badge } from "@/components/ui/badge";
import { BotaoFoil } from "@/components/ui/botao-foil";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlassPill } from "@/components/ui/glass";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuantidadeDoItem } from "@/hooks/use-quantidade-no-portfolio";
import { api, type CollectionItem, type PortfolioMetrics } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useBuscaEntreCartas } from "@/lib/busca-entre-cartas";
import { cartaCasaBusca } from "@/lib/busca-local";
import { capaVisivel } from "@/lib/cover-catalog";
import {
  resolveActiveId,
  sortByFavorite,
  usePortfolioStore,
} from "@/lib/portfolio-store";
import {
  queryKeys,
  useCollectionHistory,
  useCollectionStats,
  useFollowCounts,
  useInvalidateCollection,
  useMyProfile,
  usePortfolioDetail,
  usePortfolios,
  useShowcase,
} from "@/lib/queries";
import { precoAtual } from "@/lib/reference-price";
import { cardName, cn } from "@/lib/utils";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Posição da rolagem, por sessão. O navegador não consegue restaurar sozinho:
 * a grade é carregada por fetch no cliente, então no momento em que ele tenta
 * a página ainda não tem altura nenhuma.
 */
const SCROLL_KEY = "minty_portfolio_scroll";

const defaultMetrics: PortfolioMetrics = {
  totalInvested: 0,
  currentEstimatedValue: 0,
  profitOrLoss: 0,
  roi: 0,
};

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  prefix = "R$ ",
  suffix,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <Card className="glass-card bg-[var(--glass-bg)] shadow-none">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`size-10 rounded-lg flex items-center justify-center ${color}`}
          >
            <Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              {label}
            </p>
            <p className="text-lg font-bold text-foreground font-mono truncate">
              {prefix}
              {formatPrice(value)}
              {suffix}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PortfolioItemRow({
  item,
  isSelected,
  onSelectToggle,
  onUpdate,
  onRemove,
  isSelectionMode,
  portfolioId,
}: {
  item: CollectionItem;
  isSelected: boolean;
  onSelectToggle: (shiftKey?: boolean) => void;
  onUpdate: (id: string, data: { quantity: number }) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  isSelectionMode: boolean;
  portfolioId: string | null;
}) {
  const [removing, setRemoving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Contador compacto, o mesmo dos cards (hooks/use-quantidade-no-portfolio)
  const qtd = useQuantidadeDoItem({
    itemId: item.id,
    quantidadeServidor: item.quantity,
    onUpdate,
    pedirRemover: () => setConfirmDelete(true),
  });

  const currentPrice = precoAtual(item.card.prices);
  const totalValue = currentPrice * qtd.quantidade;
  const cardHref = `/card/${item.card.id}?from=portfolio${portfolioId ? `&portfolioId=${portfolioId}` : ""}`;

  async function handleRemove() {
    setRemoving(true);
    try {
      await onRemove(item.id);
      toast.success(`${cardName(item.card)} removido da coleção`);
    } catch {
      toast.error("Erro ao remover item");
    } finally {
      setRemoving(false);
      setConfirmDelete(false);
    }
  }

  return (
    <>
      <div
        onClick={(e) => {
          if (isSelectionMode) {
            e.preventDefault();
            e.stopPropagation();
            onSelectToggle(e.shiftKey);
          }
        }}
        className={cn(
          "flex items-center gap-4 px-4 py-3 rounded-lg border border-border bg-card hover:bg-background/50 transition-all group",
          isSelected &&
            isSelectionMode &&
            "ring-2 ring-primary border-transparent bg-primary/5",
          isSelectionMode && "cursor-pointer select-none",
        )}
      >
        <Link
          href={cardHref}
          onClick={(e) => {
            if (isSelectionMode) {
              e.preventDefault();
              e.stopPropagation();
              onSelectToggle(e.shiftKey);
            }
          }}
          className="shrink-0 h-16 w-12 rounded-md overflow-hidden flex items-center justify-center bg-muted/30"
        >
          <CardImage
            carta={item.card}
            tamanho="grade"
            alt={cardName(item.card)}
            width={48}
            height={64}
            rotulo={false}
            className="w-full h-full object-contain"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={cardHref}
            onClick={(e) => {
              if (isSelectionMode) {
                e.preventDefault();
                e.stopPropagation();
                onSelectToggle(e.shiftKey);
              }
            }}
          >
            <h3 className="text-sm font-semibold text-foreground truncate hover:text-primary transition-colors">
              {cardName(item.card)}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground truncate">
            {item.card.setName ?? item.card.setCode} • {item.card.rarity}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[9px] h-4 px-1.5">
              {item.condition}
            </Badge>
          </div>
        </div>

        <div
          className="hidden sm:flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <RollingCounter
            value={qtd.quantidade}
            onChange={qtd.definir}
            min={0}
            cell={28}
            redondo
            inercia={false}
            sucesso={qtd.sucesso}
            sucessoId={qtd.sucessoId}
          />
        </div>

        <div className="text-right shrink-0 w-32">
          <div className="flex items-center justify-end gap-1">
            <span className="text-sm font-bold text-foreground font-mono">
              R$ {formatPrice(totalValue)}
            </span>
          </div>
        </div>

        <div
          className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {!isSelectionMode && (
            <AddToPortfolioButton
              cardId={item.card.id}
              triggerClassName="size-8 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-all cursor-pointer"
            />
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(true);
            }}
            className="size-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-all cursor-pointer"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent
          className="max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Remover da coleção?</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover{" "}
              <strong>{cardName(item.card)}</strong> da sua coleção? Esta ação
              não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <GlassPill
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(false);
              }}
              className="h-9 justify-center px-4 text-sm font-bold"
            >
              Cancelar
            </GlassPill>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              disabled={removing}
              className="h-9 rounded-full px-5 text-sm font-bold"
            >
              {removing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PortfolioItemCard({
  item,
  isSelected,
  onSelectToggle,
  onUpdate,
  onRemove,
  isSelectionMode,
  portfolioId,
}: {
  item: CollectionItem;
  isSelected: boolean;
  onSelectToggle: (shiftKey?: boolean) => void;
  onUpdate: (id: string, data: { quantity: number }) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  isSelectionMode: boolean;
  portfolioId: string | null;
}) {
  const [removing, setRemoving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Contador compacto: um request ~320ms depois do último passo, o check ao
  // somar e, abaixo de 1, a confirmação de remover
  const qtd = useQuantidadeDoItem({
    itemId: item.id,
    quantidadeServidor: item.quantity,
    onUpdate,
    pedirRemover: () => setConfirmDelete(true),
  });

  const currentPrice = precoAtual(item.card.prices);
  const totalValue = currentPrice * qtd.quantidade;
  const cardHref = `/card/${item.card.id}?from=portfolio${portfolioId ? `&portfolioId=${portfolioId}` : ""}`;

  async function handleRemove() {
    setRemoving(true);
    try {
      await onRemove(item.id);
      toast.success(`${cardName(item.card)} removido da coleção`);
    } catch {
      toast.error("Erro ao remover item");
    } finally {
      setRemoving(false);
      setConfirmDelete(false);
    }
  }

  return (
    <>
      <Card
        onClick={(e) => {
          if (isSelectionMode) {
            e.preventDefault();
            e.stopPropagation();
            onSelectToggle(e.shiftKey);
          }
        }}
        className={cn(
          "group w-full h-full overflow-hidden glass-card !rounded-2xl shadow-none hover:bg-muted/30 transition-all duration-300 hover:-translate-y-1 py-0 relative",
          isSelected &&
            isSelectionMode &&
            "ring-2 ring-primary border-transparent bg-primary/5",
          isSelectionMode && "cursor-pointer select-none",
        )}
      >
        <CardContent className="p-0 flex-1 relative">
          <Link
            href={cardHref}
            onClick={(e) => {
              if (isSelectionMode) {
                e.preventDefault();
                e.stopPropagation();
                onSelectToggle(e.shiftKey);
              }
            }}
            className="block overflow-hidden p-2"
          >
            {/* CardImage e não a imagem crua: carta sem foto (ou com a foto
                quebrada) mostrava o ícone de imagem quebrada e o nome por cima
                de um vão vazio (23/10); o CardImage tenta os outros tamanhos e
                cai no "sem imagem" no formato da carta, como no Explorar */}
            <CardImage
              carta={item.card}
              tamanho="grade"
              alt={cardName(item.card)}
              className="w-full rounded-xl aspect-[5/7] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              width={400}
              height={560}
            />
          </Link>
          {/* Quantity badge: pílula translúcida quando houver 2 ou mais cartas */}
          {!isSelectionMode && qtd.quantidade > 1 && (
            <div className="pointer-events-none absolute top-2.5 right-2.5 z-10 select-none rounded-full border border-border/70 bg-background/80 px-2 py-0.5 text-[11px] font-bold text-foreground shadow-sm backdrop-blur-md tabular-nums">
              {qtd.quantidade}x
            </div>
          )}
        </CardContent>

        <div className="p-3 space-y-1">
          <Link
            href={cardHref}
            onClick={(e) => {
              if (isSelectionMode) {
                e.preventDefault();
                e.stopPropagation();
                onSelectToggle(e.shiftKey);
              }
            }}
          >
            <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-2 h-[2lh] hover:text-primary transition-colors">
              {cardName(item.card)}
            </h3>
          </Link>
          {item.card.setName &&
            // Link da coleção, como no card do Explorar (TcgCard). Precisa do
            // slug do set, que o portfólio só manda desde 30/10
            (item.card.tcg?.slug && item.card.set?.slug && !isSelectionMode ? (
              <Link
                href={`/sets/${item.card.tcg.slug}/${item.card.set.slug}`}
                className="block truncate text-xs leading-tight text-tertiary underline decoration-tertiary/40 underline-offset-2 transition-colors hover:text-tertiary-hover hover:decoration-current"
              >
                {item.card.setName}
              </Link>
            ) : (
              <p className="text-xs text-tertiary truncate leading-tight">
                {item.card.setName}
              </p>
            ))}
          <p className="text-[10px] text-muted-foreground leading-tight">
            {/* filter: sem isto, carta com raridade e sem número virava
                "Promo • null" na tela */}
            {[item.card.rarity, item.card.collectorNumber]
              .filter(Boolean)
              .join(" • ")}
          </p>

          <div className="pt-1 space-y-2">
            {/* Preço (custo/lucro saíram: o app não tem e ninguém digitava
                quanto pagou — ver o card de resumo abaixo) */}
            <div className="flex flex-col gap-1">
              {/* No celular a coluna é estreita: o preço não quebra no
                  meio ("R$" numa linha, o número na outra) e o unitário
                  desce para a linha de baixo. */}
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <span className="whitespace-nowrap text-sm font-bold text-foreground font-mono">
                  R$ {formatPrice(totalValue)}
                </span>
                <span className="whitespace-nowrap text-[10px] text-muted-foreground font-mono">
                  ({qtd.quantidade}x R$ {formatPrice(currentPrice)})
                </span>
              </div>
            </div>

            {/* Quantity control */}
            <div
              className="flex items-center justify-between gap-1 pt-1"
              onClick={(e) => e.stopPropagation()}
            >
              {/* O mesmo contador da tela da carta e dos cards */}
              <RollingCounter
                value={qtd.quantidade}
                onChange={qtd.definir}
                min={0}
                cell={28}
                redondo
                inercia={false}
                sucesso={qtd.sucesso}
                sucessoId={qtd.sucessoId}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(true);
                }}
                className="size-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-destructive/20"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent
          className="max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Remover da coleção?</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover{" "}
              <strong>{cardName(item.card)}</strong> da sua coleção? Esta ação
              não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <GlassPill
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(false);
              }}
              className="h-9 justify-center px-4 text-sm font-bold"
            >
              Cancelar
            </GlassPill>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              disabled={removing}
              className="h-9 rounded-full px-5 text-sm font-bold"
            >
              {removing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PortfolioPageSkeleton() {
  return (
    <>
      {/* Capa + card do perfil (mesma estrutura do ProfileHeader) */}
      <div className="relative -mt-14 w-full md:-mt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/60 to-background" />
        <div className="relative mx-auto max-w-screen-2xl px-4 pb-14 pt-24 sm:px-6 sm:pb-20 sm:pt-28">
          <div className="mx-auto mt-6 w-full max-w-sm md:mt-10 md:max-w-2xl">
            <div className="glass-card flex flex-col items-center gap-3 !rounded-2xl p-6 md:px-10 md:pb-8">
              <Skeleton className="-mt-[88px] size-32 rounded-full md:-mt-[104px] md:size-40" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="mt-3 h-36 w-full rounded-2xl md:h-20" />
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1480px] space-y-6 px-4 pb-6 sm:px-6 lg:px-8">
        {/* Seletor de portfólio + Novo portfólio */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-8 w-36 rounded-md" />
        </div>

        {/* Chart + resumo */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="flex min-h-[380px] flex-col gap-4 rounded-xl border border-border p-5 lg:col-span-8">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-8 w-36" />
              </div>
              <Skeleton className="h-8 w-32 self-start rounded-lg" />
            </div>
            <Skeleton className="min-h-[220px] flex-1 rounded-xl" />
          </div>
          <div className="grid min-h-[380px] grid-cols-2 gap-3 rounded-xl border border-border p-5 lg:col-span-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="rounded-xl" />
            ))}
          </div>
        </div>

        {/* Busca */}
        <Skeleton className="h-11 w-full rounded-2xl" />

        {/* Sidebar de filtros + grid */}
        <div className="flex gap-6">
          <div className="hidden w-60 shrink-0 lg:block">
            <Skeleton className="h-[420px] rounded-2xl" />
          </div>
          <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: placeholders estáticos
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-5/7 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export default function PortfolioPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const { data: stats } = useCollectionStats(!!session?.user);
  const isPro =
    stats?.isPro ??
    (session?.user as { isPro?: boolean } | undefined)?.isPro ??
    false;

  // "Ver como visitante": pré-visualiza o perfil público (read-only) na mesma tela.
  const [preview, setPreview] = useState(false);
  const previewHandle =
    (session?.user as { handle?: string } | undefined)?.handle ?? "";
  const { data: showcaseData, isLoading: showcaseLoading } = useShowcase(
    previewHandle,
    preview,
  );
  // Descrição e links do dono: o cabeçalho é o mesmo do perfil público, então
  // mostra o mesmo que o visitante vê. Endpoint leve — o showcase traria a
  // coleção inteira só para ler dois campos.
  const { data: meuPerfil } = useMyProfile(!!session?.user);
  // Seguidores/seguindo do dono — mesma rota leve que o app usa
  const { data: contagens } = useFollowCounts(!!session?.user);

  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  // Filtros da coleção (mesmos do showcase) — sidebar + busca.
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<
    "value-desc" | "value-asc" | "name" | "qty-desc"
  >("value-desc");
  const [productType, setProductType] = useState<ProductTypeValue>("all");
  const [filterTcgs, setFilterTcgs] = useState<string[]>([]);
  const [filterRarities, setFilterRarities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  // Lista e detalhe vêm do TanStack Query, com as MESMAS chaves que Explore e a
  // página da carta usam — navegar entre elas não refaz busca nenhuma.
  const portfoliosQuery = usePortfolios(!!session?.user);
  const queryClient = useQueryClient();
  const invalidateCollection = useInvalidateCollection();
  // O que `/collection/portfolios/:id` devolve — usado no patch otimista.
  type PortfolioDetalhe = Awaited<
    ReturnType<typeof api.collection.getPortfolio>
  >;
  // Contexto vem do store: sobrevive a sair para a carta e voltar
  const activeId = usePortfolioStore((s) => s.activeId);
  const favoriteIds = usePortfolioStore((s) => s.favoriteIds);
  const setActivePortfolioId = usePortfolioStore((s) => s.setActive);
  const activePortfolioId = activeId;
  const portfolios = useMemo(
    () => sortByFavorite(portfoliosQuery.data ?? [], favoriteIds),
    [portfoliosQuery.data, favoriteIds],
  );
  const detailQuery = usePortfolioDetail(activePortfolioId || undefined);
  const items: CollectionItem[] = detailQuery.data?.items ?? [];
  // Antes de qualquer return: é hook. Ids estáveis enquanto a coleção não muda.
  const idsDoPortfolio = useMemo(
    () => (detailQuery.data?.items ?? []).map((i) => i.card.id),
    [detailQuery.data],
  );
  const achadasNoServidor = useBuscaEntreCartas(search, idsDoPortfolio);
  const metrics: PortfolioMetrics = detailQuery.data?.metrics ?? defaultMetrics;
  // Ordem congelada da grade — ver `compareItems` mais abaixo. Guarda os ids na
  // sequência exibida e a assinatura dos critérios que a produziram.
  const orderRef = useRef<{ signature: string; ids: string[] }>({
    signature: "",
    ids: [],
  });
  // Skeleton enquanto a lista não chegou, ou enquanto o detalhe do portfólio
  // ativo está vindo pela primeira vez.
  const loading =
    portfoliosQuery.isPending || (!!activePortfolioId && detailQuery.isPending);
  const scrollYRef = useRef(0);
  const scrollRestauradoRef = useRef(false);

  // Acompanha a rolagem sem escrever a cada evento; grava só ao desmontar,
  // que é quando o usuário sai para a tela da carta.
  useEffect(() => {
    const acompanhar = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener("scroll", acompanhar, { passive: true });
    return () => {
      window.removeEventListener("scroll", acompanhar);
      sessionStorage.setItem(SCROLL_KEY, String(scrollYRef.current));
    };
  }, []);

  // Restaura só depois que a grade renderizou — antes disso a página não tem
  // altura suficiente e o scrollTo não teria para onde ir.
  useEffect(() => {
    if (scrollRestauradoRef.current || loading || items.length === 0) return;
    scrollRestauradoRef.current = true;
    const salvo = Number(sessionStorage.getItem(SCROLL_KEY) ?? 0);
    if (salvo > 0) {
      requestAnimationFrame(() => window.scrollTo({ top: salvo }));
    }
  }, [loading, items.length]);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);

  const portfoliosLoaded = !portfoliosQuery.isPending;
  const [historyRange, setHistoryRange] = useState<"7d" | "1m" | "3m" | "6m">(
    "1m",
  );
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Substitui o cache artesanal em useRef, que a cada acerto ainda disparava um
  // "silent background update" — ou seja, requisitava sempre.
  const historyQuery = useCollectionHistory(
    historyRange,
    activePortfolioId || undefined,
    !!session?.user && !!activePortfolioId,
  );
  const historyLoading = historyQuery.isPending;
  const historyData = useMemo(
    () =>
      (historyQuery.data ?? []).map((d) => ({
        date: new Date(d.date),
        value: d.value,
      })),
    [historyQuery.data],
  );

  const { chartDiffValue, chartDiffPercent } = useMemo(() => {
    if (historyData.length < 2)
      return { chartDiffValue: 0, chartDiffPercent: 0 };
    const firstVal = historyData[0].value;
    const lastVal = historyData[historyData.length - 1].value;
    const diffVal = lastVal - firstVal;
    const diffPct = firstVal > 0 ? (diffVal / firstVal) * 100 : 0;
    return { chartDiffValue: diffVal, chartDiffPercent: diffPct };
  }, [historyData]);

  function openNewPortfolioOrPaywall() {
    // Grátis: até 5 portfólios. Pro: ilimitado (o backend aplica a mesma regra).
    const isPro =
      stats?.isPro ??
      (session?.user as { isPro?: boolean } | undefined)?.isPro ??
      false;
    if (!isPro && portfolios.length >= 5) {
      setProModalOpen(true);
    } else {
      setShowNewDialog(true);
    }
  }

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/login?redirect=/portfolio");
    }
  }, [session, sessionLoading, router]);

  // Qual portfólio fica ativo quando a lista chega. Só define quando não há
  // contexto válido — escolha do usuário que ainda exista na lista nunca é
  // sobrescrita por um refetch.
  useEffect(() => {
    if (portfolios.length === 0) return;
    const alvo = resolveActiveId(portfolios, activeId, favoriteIds);
    if (alvo && alvo !== activeId) setActivePortfolioId(alvo);
  }, [portfolios, activeId, favoriteIds, setActivePortfolioId]);

  // Trocar de portfólio zera a seleção múltipla — ids de outro portfólio não
  // fazem sentido na grade nova.
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activePortfolioId]);

  /**
   * Aplica a mudança no cache antes da resposta do servidor — é o que faz o
   * stepper responder na hora. Devolve o estado anterior para desfazer se o
   * request falhar.
   */
  const patchItemsOtimista = useCallback(
    (mudar: (prev: CollectionItem[]) => CollectionItem[]) => {
      if (!activePortfolioId) return undefined;
      const key = queryKeys.portfolioDetail(activePortfolioId);
      const anterior = queryClient.getQueryData<PortfolioDetalhe>(key);
      if (anterior) {
        queryClient.setQueryData<PortfolioDetalhe>(key, {
          ...anterior,
          items: mudar(anterior.items),
        });
      }
      return () => queryClient.setQueryData(key, anterior);
    },
    [activePortfolioId, queryClient],
  );

  const updateItem = useCallback(
    async (id: string, data: { quantity: number }) => {
      const desfazer = patchItemsOtimista((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data } : item)),
      );
      try {
        await api.collection.update(id, data);
        // Uma invalidação repõe itens, métricas, histórico e stats.
        await invalidateCollection();
      } catch (err) {
        desfazer?.();
        throw err;
      }
    },
    [patchItemsOtimista, invalidateCollection],
  );

  const removeItem = useCallback(
    async (id: string) => {
      const desfazer = patchItemsOtimista((prev) =>
        prev.filter((item) => item.id !== id),
      );
      try {
        await api.collection.remove(id);
        await invalidateCollection();
      } catch {
        desfazer?.();
      }
    },
    [patchItemsOtimista, invalidateCollection],
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const lastSelectedIdRef = useRef<string | null>(null);
  const [bulkAction, setBulkAction] = useState<
    "copy" | "move" | "delete" | null
  >(null);
  const [bulkTargetId, setBulkTargetId] = useState<string>("");
  const [bulkPhase, setBulkPhase] = useState<
    "select" | "new_portfolio" | "confirm" | "progress" | "done"
  >("select");
  const [bulkStatus, setBulkStatus] = useState<
    Record<string, "pending" | "done" | "error">
  >({});
  const [newBulkPortfolioName, setNewBulkPortfolioName] = useState("");
  const [creatingBulkPortfolio, setCreatingBulkPortfolio] = useState(false);

  const handleCreateBulkPortfolio = async () => {
    if (!newBulkPortfolioName.trim()) return;
    setCreatingBulkPortfolio(true);
    try {
      const created = await api.collection.createPortfolio(
        newBulkPortfolioName.trim(),
      );
      await invalidateCollection();
      setBulkTargetId(created.id);
      setBulkPhase("confirm");
      setNewBulkPortfolioName("");
      toast.success(`Portfólio "${created.name}" criado!`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao criar portfólio",
      );
    } finally {
      setCreatingBulkPortfolio(false);
    }
  };

  const toggleSelect = (id: string, shiftKey = false) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const orderedIds = orderRef.current.ids;
      if (shiftKey && lastSelectedIdRef.current && orderedIds.length > 0) {
        const startIdx = orderedIds.indexOf(lastSelectedIdRef.current);
        const endIdx = orderedIds.indexOf(id);
        if (startIdx !== -1 && endIdx !== -1) {
          const [from, to] =
            startIdx <= endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
          for (let i = from; i <= to; i++) {
            next.add(orderedIds[i]);
          }
          lastSelectedIdRef.current = id;
          return next;
        }
      }

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      lastSelectedIdRef.current = id;
      return next;
    });
  };

  const openBulkAction = (action: "copy" | "move" | "delete") => {
    setBulkAction(action);
    setBulkPhase(action === "delete" ? "confirm" : "select");
    setBulkTargetId("");
    setNewBulkPortfolioName("");
  };

  const executeBulkAction = async () => {
    if (!bulkAction) return;
    setBulkPhase("progress");

    const selectedItems = items.filter((item) => selectedIds.has(item.id));
    const initialStatus: Record<string, "pending" | "done" | "error"> = {};
    for (const item of selectedItems) {
      initialStatus[item.id] = "pending";
    }
    setBulkStatus(initialStatus);

    if (bulkAction === "delete") {
      for (const item of selectedItems) {
        try {
          await api.collection.remove(item.id);
          setBulkStatus((prev) => ({ ...prev, [item.id]: "done" }));
        } catch {
          setBulkStatus((prev) => ({ ...prev, [item.id]: "error" }));
        }
      }
    } else {
      const targetPortfolioId = bulkTargetId;
      for (const item of selectedItems) {
        try {
          await api.collection.add({
            portfolioId: targetPortfolioId,
            cardId: item.card.id,
            quantity: item.quantity,
            condition: item.condition,
            buyPrice: item.buyPrice ?? undefined,
            notes: item.notes ?? undefined,
          });
          setBulkStatus((prev) => ({ ...prev, [item.id]: "done" }));
        } catch {
          setBulkStatus((prev) => ({ ...prev, [item.id]: "error" }));
        }
      }

      if (bulkAction === "move") {
        for (const item of selectedItems) {
          if (bulkStatus[item.id] !== "error") {
            try {
              await api.collection.remove(item.id);
            } catch {}
          }
        }
      }
    }

    setBulkPhase("done");
  };

  const finishBulkAction = () => {
    setBulkAction(null);
    setSelectedIds(new Set());
    // Copiar/mover mexe em outros portfólios também — invalida a coleção toda.
    invalidateCollection();
  };

  if (sessionLoading || (session?.user && !portfoliosLoaded)) {
    return <PortfolioPageSkeleton />;
  }

  if (!session?.user) return null;

  const activePortfolio = portfolios.find((p) => p.id === activePortfolioId);

  // Facetas + filtragem da coleção (sidebar). Mesma lógica do showcase.
  const tcgFacets = facetOptions(items, (i) => i.card.tcg?.name);
  const rarityFacets = facetOptions(items, (i) => i.card.rarity);
  const priceCeil = Math.max(
    50,
    ...items.map((i) => Math.ceil(precoAtual(i.card.prices))),
  );
  // Cartas × selados (30/10): a contagem do controle Tudo · Cartas · Selados
  // e a divisão do valor no card do total. Selado não tem variação, então o
  // valor dele é o preço que a grade mostra; o das cartas é o resto do total,
  // para a soma bater sempre com o número de cima.
  const ehSelado = (i: (typeof items)[number]) =>
    i.card.productType === "SEALED";
  const contagemPorTipo = {
    cartas: items
      .filter((i) => !ehSelado(i))
      .reduce((n, i) => n + i.quantity, 0),
    selados: items.filter(ehSelado).reduce((n, i) => n + i.quantity, 0),
  };
  const valorSelados = items
    .filter(ehSelado)
    .reduce((soma, i) => soma + precoAtual(i.card.prices) * i.quantity, 0);
  // "2 selados", "66 itens" ou "64 cartas": com selado na lista, "cartas"
  // deixa de ser a palavra certa (30/10)
  const rotuloDaContagem = (n: number) => {
    if (productType === "sealed") return n === 1 ? "selado" : "selados";
    if (productType === "all" && contagemPorTipo.selados > 0)
      return n === 1 ? "item" : "itens";
    return n === 1 ? "carta" : "cartas";
  };
  const filteredItems = items.filter((i) => {
    const pt = i.card.productType ?? "SINGLE";
    if (productType === "single" && pt !== "SINGLE") return false;
    if (productType === "sealed" && pt !== "SEALED") return false;
    if (
      filterTcgs.length > 0 &&
      (!i.card.tcg?.name || !filterTcgs.includes(i.card.tcg.name))
    )
      return false;
    if (filterRarities.length > 0 && !filterRarities.includes(i.card.rarity))
      return false;
    const unit = precoAtual(i.card.prices);
    if (priceRange && (unit < priceRange[0] || unit > priceRange[1]))
      return false;
    // Nome em PT também: a grade mostra o PT, e buscar o que está escrito na
    // tela não achava nada ("Força Celeste" só casava como "Sky Striker").
    // Local na hora + motor do Explorar no servidor (código sem hífen, erro de
    // digitação) — ver useBuscaEntreCartas.
    const q = search.trim();
    if (q && !cartaCasaBusca(i.card, q) && !achadasNoServidor?.has(i.card.id))
      return false;
    return true;
  });
  const cartasTotal = items.reduce((soma, i) => soma + i.quantity, 0);
  const cartasFiltradas = filteredItems.reduce(
    (soma, i) => soma + i.quantity,
    0,
  );
  function compareItems(a: CollectionItem, b: CollectionItem) {
    const av = precoAtual(a.card.prices) * a.quantity;
    const bv = precoAtual(b.card.prices) * b.quantity;
    switch (sort) {
      case "value-asc":
        return av - bv;
      case "name":
        // Pelo nome que aparece no card (PT quando houver)
        return cardName(a.card).localeCompare(cardName(b.card), "pt-BR");
      case "qty-desc":
        return b.quantity - a.quantity;
      default:
        return bv - av;
    }
  }

  /**
   * A ordem exibida é congelada enquanto o usuário mexe nas quantidades.
   *
   * "Maior valor" e "quantidade" dependem de `quantity`, então reordenar a cada
   * alteração faz o card pular de posição embaixo do cursor — e o clique
   * seguinte cai no card errado. A lista só se reorganiza quando muda o
   * critério, um filtro, a busca ou o portfólio.
   */
  const orderSignature = JSON.stringify({
    sort,
    productType,
    filterTcgs,
    filterRarities,
    priceRange,
    search: search.trim(),
    activePortfolioId,
  });

  if (orderRef.current.signature !== orderSignature) {
    orderRef.current = {
      signature: orderSignature,
      ids: [...filteredItems].sort(compareItems).map((i) => i.id),
    };
  } else {
    // Itens que entraram depois (uma carta recém-adicionada) ainda não estão na
    // ordem congelada; posiciona-os agora para não sumirem da lista.
    const conhecidos = new Set(orderRef.current.ids);
    const novos = filteredItems.filter((i) => !conhecidos.has(i.id));
    if (novos.length > 0) {
      orderRef.current = {
        signature: orderSignature,
        ids: [
          ...novos.sort(compareItems).map((i) => i.id),
          ...orderRef.current.ids,
        ],
      };
    }
  }

  const posicao = new Map(orderRef.current.ids.map((id, i) => [id, i]));
  filteredItems.sort(
    (a, b) => (posicao.get(a.id) ?? 0) - (posicao.get(b.id) ?? 0),
  );

  const u = session.user as {
    name?: string | null;
    nickname?: string | null;
    image?: string | null;
    handle?: string | null;
    isPro?: boolean | null;
    coverType?: string | null;
    coverValue?: string | null;
  };
  const ownerHandle = u.handle ?? "";
  const shareUrl =
    typeof window !== "undefined" && ownerHandle
      ? `${window.location.origin}/showcase/profile/@${ownerHandle}`
      : "";

  async function handleShareProfile() {
    if (!shareUrl) return;
    try {
      if (navigator.share) await navigator.share({ url: shareUrl });
      else await navigator.clipboard.writeText(shareUrl);
    } catch {
      /* cancelado */
    }
  }

  return (
    <>
      {/* Cabeçalho unificado (mesmo do /showcase) — dados do dono */}
      <ProfileHeader
        displayName={u.nickname ?? u.name ?? "Colecionador"}
        handle={ownerHandle}
        image={u.image ?? null}
        isPro={stats?.isPro ?? u.isPro ?? false}
        memberSince={stats?.memberSince ?? null}
        totalCards={stats?.totalCards ?? 0}
        totalPortfolios={portfolios.length}
        totalSealed={stats?.totalSealed ?? 0}
        totalValue={stats?.totalValue ?? 0}
        cover={capaVisivel(
          {
            type: (u.coverType ?? "gradient") as
              | "gradient"
              | "color"
              | "preset"
              | "image",
            value: u.coverValue ?? null,
          },
          stats ? !!(stats.isPro || u.isPro) : undefined,
        )}
        bio={meuPerfil?.bio}
        socials={meuPerfil?.socials}
        social={
          ownerHandle ? (
            <SocialStats
              handle={ownerHandle}
              followers={contagens?.followers ?? 0}
              following={contagens?.following ?? 0}
            />
          ) : undefined
        }
      />

      {preview ? (
        /* Pré-visualização pública (read-only) — o que os visitantes veem */
        <main className="mx-auto max-w-screen-2xl space-y-4 px-4 pb-8 sm:px-6">
          {/* Tag unificada de pré-visualização no canto direito */}
          <div className="flex items-center justify-end pt-1 animate-in fade-in duration-200">
            <button
              type="button"
              onClick={() => setPreview(false)}
              title="Clique para sair da pré-visualização"
              className="glass-pill animate-soft-pulse group inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border border-primary/30 bg-background/70 px-3 text-xs font-medium text-foreground backdrop-blur transition-all active:scale-95"
            >
              <span>Visualizando como visitante</span>
              <IconEyeCancel className="size-3.5 text-primary" />
            </button>
          </div>
          {showcaseLoading || !showcaseData ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : showcaseData.portfolios.some((p) => p.items.length > 0) ? (
            <ShowcaseBrowser portfolios={showcaseData.portfolios} />
          ) : (
            <EstadoVazio
              emCard
              icon={Package}
              titulo="Sua coleção ainda não tem cartas"
              descricao="Adicione cartas e elas aparecem no seu perfil público."
            />
          )}
        </main>
      ) : (
        <main className="mx-auto max-w-370 space-y-6 px-4 pt-6 pb-6 sm:px-6 lg:px-8">
          {/* Seletor de portfólio + ações de perfil NA MESMA LINHA (ícones no mobile) */}
          {portfolios.length > 0 && (
            <div className="flex items-center justify-between gap-2 animate-in fade-in duration-300">
              <div className="flex items-center gap-1.5 min-w-0">
                <PortfolioSelector
                  portfolios={portfolios}
                  activePortfolioId={activePortfolioId ?? ""}
                  onSelect={setActivePortfolioId}
                  onRefresh={invalidateCollection}
                />
                <BotaoNovoPortfolio onClick={openNewPortfolioOrPaywall} />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <PedidosButton />
                <AdicionarAmigos />
                <button
                  type="button"
                  onClick={() => setPreview((p) => !p)}
                  title="Ver como visitante"
                  aria-label="Ver como visitante"
                  className="inline-flex size-8 sm:h-8 sm:w-auto shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-background/70 p-0 sm:px-3 text-[11px] font-bold text-foreground backdrop-blur transition-colors hover:bg-muted/60"
                >
                  <IconEye className="size-4 shrink-0" />
                  <span className="hidden sm:inline">Ver como visitante</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareProfile}
                  title="Compartilhar perfil"
                  aria-label="Compartilhar perfil"
                  className="inline-flex size-8 sm:h-8 sm:w-auto shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-primary p-0 sm:px-3 text-[11px] font-bold text-white transition-colors hover:bg-primary/90 shadow-sm"
                >
                  <IconShare2 className="size-4 shrink-0" />
                  <span className="hidden sm:inline">Compartilhar</span>
                </button>
              </div>
            </div>
          )}

          {activePortfolio && (
            <>
              {/* Convite pro app entre o seletor e o gráfico: embaixo dos
                  insights ele ficava fora da primeira tela */}
              {!loading && items.length > 0 && (
                <ConviteAppFaixa
                  id="portfolio"
                  titulo="Adicionar carta por carta cansa"
                  texto="No app você escaneia várias cartas numa foto só, e elas entram no seu portfólio com o preço do dia."
                />
              )}

              {/* Dashboard Metrics and Chart Section */}
              {/* Portfólio sem cartas não tem gráfico: os pontos do histórico
                  são todos R$ 0, e a linha zerada com "+0.00%" parecia erro.
                  O "Portfólio vazio" logo abaixo já diz o que fazer (23/10). */}
              {(loading || items.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Gráfico na largura toda, como o topo do Portfólio no app. O
                    card de resumo (Total investido / Lucro / ROI) saiu: o app
                    não tem, e o "preço de compra" era o preço do dia em que a
                    carta foi adicionada — o "lucro" era só a variação desde
                    então, e parte dos valores tinha sido gravada em dólar. */}
                  <Card
                    className={cn(
                      "relative lg:col-span-12 glass-card bg-[var(--glass-bg)] shadow-none overflow-hidden p-5 flex flex-col justify-between",
                      // Sem gráfico o card fica da altura do conteúdo: os 380px
                      // eram para o gráfico e deixavam o aviso solto (21/10)
                      (loading || historyData.length > 1) && "min-h-[380px]",
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Histórico de Valor da Coleção
                        </h3>
                        <div className="flex items-baseline gap-2 mt-1">
                          {loading ? (
                            <Skeleton className="h-8 w-36" />
                          ) : (
                            <>
                              {/* Mesmo número do card do perfil: fonte do
                                sistema, R$ menor e em cinza */}
                              <span className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
                                <span className="mr-1 text-base font-bold text-muted-foreground">
                                  R$
                                </span>
                                {formatPrice(metrics.currentEstimatedValue)}
                              </span>
                              {historyData.length >= 2 && (
                                <div className="flex items-center gap-1">
                                  {chartDiffPercent >= 0 ? (
                                    <TrendingUp className="size-3 text-emerald-400" />
                                  ) : (
                                    <TrendingDown className="size-3 text-red-400" />
                                  )}
                                  <span
                                    className={cn(
                                      "text-xs font-bold font-mono",
                                      chartDiffPercent >= 0
                                        ? "text-emerald-400"
                                        : "text-red-400",
                                    )}
                                  >
                                    {chartDiffPercent >= 0 ? "+" : ""}
                                    {chartDiffPercent.toFixed(2)}% (
                                    {chartDiffValue >= 0 ? "+" : ""}R${" "}
                                    {formatPrice(chartDiffValue)})
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        {/* Quanto do total é carta e quanto é selado (30/10) */}
                        {!loading && valorSelados > 0 && (
                          <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                            Cartas R${" "}
                            {formatPrice(
                              Math.max(
                                0,
                                metrics.currentEstimatedValue - valorSelados,
                              ),
                            )}{" "}
                            · Selados R$ {formatPrice(valorSelados)}
                          </p>
                        )}
                      </div>

                      {/* Range Selector */}
                      <Tabs
                        value={historyRange}
                        onValueChange={(v) =>
                          setHistoryRange(v as typeof historyRange)
                        }
                        className="self-start sm:self-auto"
                      >
                        <TabsList>
                          {(["7d", "1m", "3m", "6m"] as const).map((r) => (
                            <TabsTrigger
                              key={r}
                              value={r}
                              className="text-xs font-bold px-2.5"
                            >
                              {r.toUpperCase()}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </Tabs>
                    </div>

                    {/* Chart container */}
                    {/* Sem histórico não há gráfico: a área vira só o espaço do
                      aviso, centralizado abaixo do valor e dos botões de
                      período, e o card encolhe junto (21/10) */}
                    <div
                      className={cn(
                        "flex-1 w-full",
                        loading || historyData.length > 1
                          ? "relative min-h-[220px]"
                          : "flex items-center justify-center py-8",
                      )}
                    >
                      {loading ? (
                        <Skeleton className="absolute inset-0 rounded-xl" />
                      ) : (
                        <>
                          {historyLoading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/25 backdrop-blur-xs rounded-xl">
                              <Loader2 className="size-8 animate-spin text-primary" />
                            </div>
                          )}
                          {historyData.length > 1 ? (
                            <AreaChart
                              data={historyData as any[]}
                              xDataKey="date"
                              margin={{
                                top: 10,
                                right: 10,
                                bottom: 25,
                                left: 10,
                              }}
                              aspectRatio="2.8 / 1"
                              // Teto de altura: só a proporção deixava o gráfico
                              // com ~360px numa tela larga. No celular ele fica
                              // abaixo disso e segue a proporção.
                              className="w-full h-full max-h-[240px]"
                            >
                              <Grid
                                horizontal
                                vertical={false}
                                numTicksRows={4}
                                stroke="var(--chart-grid)"
                                strokeDasharray="4,4"
                              />
                              <Area
                                dataKey="value"
                                fill="var(--primary)" // vibrant primary brand pink
                                fillOpacity={0.15}
                                stroke="var(--primary)"
                                strokeWidth={2.5}
                                gradientToOpacity={0.01}
                              />
                              <ChartTooltip
                                rows={(point) => [
                                  {
                                    color: "var(--primary)",
                                    label: "Valor Total",
                                    value: `R$ ${formatPrice(Number(point.value))}`,
                                  },
                                ]}
                              />
                              <XAxis numTicks={6} />
                            </AreaChart>
                          ) : (
                            <EstadoVazio
                              compacto
                              className="py-0"
                              icon={TrendingUp}
                              titulo="Histórico em construção"
                              descricao="O gráfico de evolução histórica será desenhado à medida que sua coleção for atualizada nos próximos dias."
                            />
                          )}
                        </>
                      )}
                    </div>

                    {/* Exportar no pé do card do valor, como no app: na barra
                        das cartas ele era só um ícone de planilha, e no
                        celular sumia o ✨ que avisa que é do Pro (30/10) */}
                    {!loading && !!activePortfolioId && items.length > 0 && (
                      <div className="mt-3 flex justify-end">
                        {isPro ? (
                          <a
                            href={`${API_URL}/collection/export.xlsx?portfolioId=${activePortfolioId}`}
                            className="glass-pill inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 text-xs font-bold text-foreground transition-colors"
                          >
                            <FileSpreadsheet className="size-3.5 shrink-0" />
                            Exportar planilha
                          </a>
                        ) : (
                          <GlassPill
                            onClick={() => setProModalOpen(true)}
                            className="h-8 gap-1.5 px-3 text-xs font-bold"
                          >
                            <FileSpreadsheet className="size-3.5 shrink-0" />
                            Exportar planilha
                            <Sparkles className="size-3 text-primary" />
                          </GlassPill>
                        )}
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* Top cartas / Por jogo logo abaixo do gráfico: no rodapé, quem
                  tem muitas cartas nunca chegava até eles. */}
              {!loading && <CollectionInsights stats={stats ?? null} />}

              {/* Collection Items */}
              {loading ? (
                <>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-36" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-36 rounded-lg" />
                      <Skeleton className="h-8 w-16 rounded-lg" />
                    </div>
                  </div>
                  {viewType === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="w-full rounded-lg aspect-2/3" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-lg" />
                      ))}
                    </div>
                  )}
                </>
              ) : detailQuery.isError ? (
                // Falha não pode dizer que o portfólio está vazio: a pessoa lê
                // que a coleção sumiu. Mesma regra do app.
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Não foi possível carregar este portfólio
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                    Suas cartas continuam salvas. Tente de novo em instantes.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => void detailQuery.refetch()}
                    disabled={detailQuery.isFetching}
                  >
                    Tentar de novo
                  </Button>
                </div>
              ) : items.length === 0 ? (
                <EstadoVazio
                  icon={Package}
                  titulo="Portfólio vazio"
                  descricao="Explore o catálogo e adicione cartas a este portfólio, ou escaneie as suas pelo app."
                >
                  <BotaoFoil asChild>
                    <Link href="/explore">
                      <Plus />
                      Explorar cartas
                    </Link>
                  </BotaoFoil>
                  <GlassPill asChild className="h-9 px-4 text-sm">
                    <Link href="/download">
                      <ScanLine className="size-4" />
                      Escanear no app
                    </Link>
                  </GlassPill>
                </EstadoVazio>
              ) : (
                <div className="space-y-4">
                  {/* Busca — pill de vidro (igual showcase) */}
                  <div className="relative w-full">
                    <div className="glass-input flex h-11 items-center gap-2.5 px-4">
                      <Search className="size-4 shrink-0 text-muted-foreground" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar nesta coleção..."
                        className="h-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                      />
                      {search.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSearch("")}
                          className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-6">
                    {/* Sidebar de filtros (igual showcase) */}
                    <aside className="hidden w-60 shrink-0 lg:block">
                      <PainelFiltros>
                        {tcgFacets.length > 0 && (
                          <FilterSection title="Jogo / Categoria">
                            <CheckboxFilterList
                              idPrefix="pf-tcg"
                              options={tcgFacets.map((f) => ({
                                value: f.value,
                                label: f.value,
                                count: f.count,
                              }))}
                              selected={filterTcgs}
                              onToggle={(v) =>
                                setFilterTcgs((prev) => toggleValue(prev, v))
                              }
                            />
                          </FilterSection>
                        )}
                        {rarityFacets.length > 0 && (
                          <FilterSection title="Raridade">
                            <CheckboxFilterList
                              idPrefix="pf-rarity"
                              options={rarityFacets.map((f) => ({
                                value: f.value,
                                label: f.value,
                                count: f.count,
                              }))}
                              selected={filterRarities}
                              onToggle={(v) =>
                                setFilterRarities((prev) =>
                                  toggleValue(prev, v),
                                )
                              }
                            />
                          </FilterSection>
                        )}
                        <PriceRangeFilter
                          isPro
                          value={priceRange}
                          ceil={priceCeil}
                          onChange={setPriceRange}
                          onUpsell={() => {}}
                        />
                      </PainelFiltros>
                    </aside>

                    {/* Conteúdo: toolbar + grid/lista (cartas de gestão) */}
                    <div className="min-w-0 flex-1 space-y-4">
                      {contagemPorTipo.selados > 0 && !isSelectionMode && (
                        <AlternarTipoDeProduto
                          valor={productType}
                          onChange={setProductType}
                          contagem={contagemPorTipo}
                        />
                      )}
                      {isSelectionMode ? (
                        /* Modo de Seleção: Linha única. Na direita, estritamente as 3 ações (Copiar, Mover, Excluir). Zero botões de sistema */
                        <div className="flex items-center justify-between gap-2 animate-in fade-in duration-300">
                          <div className="flex items-center gap-1.5 text-xs min-w-0">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedIds(new Set());
                                lastSelectedIdRef.current = null;
                                setIsSelectionMode(false);
                              }}
                              title="Cancelar seleção"
                              className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                            >
                              <X className="size-3.5" />
                            </button>
                            {selectedIds.size > 0 ? (
                              <span className="font-bold text-primary whitespace-nowrap">
                                {selectedIds.size}{" "}
                                {selectedIds.size === 1
                                  ? "selecionada"
                                  : "selecionadas"}
                              </span>
                            ) : (
                              <p className="whitespace-nowrap text-muted-foreground">
                                {cartasFiltradas}{" "}
                                {rotuloDaContagem(cartasFiltradas)}
                              </p>
                            )}
                            <span className="text-muted-foreground/40">•</span>
                            {selectedIds.size < filteredItems.length ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedIds(
                                    new Set(filteredItems.map((i) => i.id)),
                                  )
                                }
                                className="cursor-pointer font-semibold text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
                              >
                                Todas
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedIds(new Set());
                                  lastSelectedIdRef.current = null;
                                }}
                                className="cursor-pointer font-semibold text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
                              >
                                Limpar
                              </button>
                            )}
                          </div>

                          {/* Ações de lote: SÃO ESTRITAMENTE AS TRÊS (Copiar, Mover, Excluir). Zero botões de sistema */}
                          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            {selectedIds.size > 0 && (
                              <>
                                <GlassPill
                                  onClick={() => openBulkAction("copy")}
                                  title="Copiar cartas selecionadas"
                                  className="h-8 gap-1.5 px-2.5 sm:px-3 text-xs font-bold"
                                >
                                  <Copy className="size-3.5" />
                                  <span className="hidden sm:inline">
                                    Copiar
                                  </span>
                                </GlassPill>
                                <GlassPill
                                  onClick={() => openBulkAction("move")}
                                  title="Mover cartas selecionadas"
                                  className="h-8 gap-1.5 px-2.5 sm:px-3 text-xs font-bold"
                                >
                                  <ArrowRight className="size-3.5" />
                                  <span className="hidden sm:inline">
                                    Mover
                                  </span>
                                </GlassPill>
                                <button
                                  type="button"
                                  onClick={() => openBulkAction("delete")}
                                  title="Excluir cartas selecionadas"
                                  className="inline-flex h-8 gap-1.5 px-2.5 sm:px-3 cursor-pointer items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive text-xs font-bold transition-colors hover:bg-destructive hover:text-white"
                                >
                                  <Trash2 className="size-3.5" />
                                  <span className="hidden sm:inline">
                                    Excluir
                                  </span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Modo Normal: Tudo alinhado perfeitamente em UMA LINHA no mobile e desktop */
                        <div className="flex items-center justify-between gap-2 animate-in fade-in duration-300">
                          {/* Contagem de cartas */}
                          <p className="whitespace-nowrap text-xs text-muted-foreground font-medium shrink-0">
                            {cartasFiltradas}{" "}
                            {rotuloDaContagem(cartasFiltradas)}
                            <span className="hidden sm:inline">
                              {cartasFiltradas !== cartasTotal
                                ? ` de ${cartasTotal}`
                                : ""}
                            </span>
                          </p>

                          {/* Selecionar, Ordenação e Grade/Lista numa linha só. O
                              Exportar foi para o card do valor, como no app (30/10) */}
                          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            <GlassPill
                              onClick={() => setIsSelectionMode(true)}
                              title="Selecionar cartas"
                              className="h-8 gap-1.5 px-2.5 sm:px-3 text-xs font-bold"
                            >
                              <Check className="size-3.5 shrink-0" />
                              Selecionar
                            </GlassPill>

                            <Select
                              value={sort}
                              onValueChange={(v) => setSort(v as typeof sort)}
                            >
                              <SelectTrigger
                                size="sm"
                                aria-label="Ordenar coleção"
                                className="glass-pill h-8 cursor-pointer gap-1.5 rounded-full border px-2.5 sm:px-3 text-xs font-bold text-foreground shadow-none max-sm:[&>svg:last-child]:hidden"
                              >
                                <ArrowUpDown className="size-3.5 shrink-0 text-muted-foreground" />
                                <span className="hidden sm:inline">
                                  <SelectValue />
                                </span>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="value-desc">
                                  Maior valor
                                </SelectItem>
                                <SelectItem value="value-asc">
                                  Menor valor
                                </SelectItem>
                                <SelectItem value="name">
                                  Nome: A → Z
                                </SelectItem>
                                <SelectItem value="qty-desc">
                                  Quantidade
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <AlternarVisao
                              valor={viewType}
                              onChange={setViewType}
                            />
                          </div>
                        </div>
                      )}

                      {filteredItems.length === 0 ? (
                        <EstadoVazio
                          emCard
                          icon={Search}
                          titulo="Nenhuma carta encontrada"
                          descricao="Ajuste a busca ou os filtros."
                        />
                      ) : viewType === "grid" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                          {filteredItems.map((item) => (
                            <PortfolioItemCard
                              key={item.id}
                              item={item}
                              isSelected={selectedIds.has(item.id)}
                              onSelectToggle={(shiftKey) =>
                                toggleSelect(item.id, shiftKey)
                              }
                              onUpdate={updateItem}
                              onRemove={removeItem}
                              isSelectionMode={isSelectionMode}
                              portfolioId={activePortfolioId}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredItems.map((item) => (
                            <PortfolioItemRow
                              key={item.id}
                              item={item}
                              isSelected={selectedIds.has(item.id)}
                              onSelectToggle={(shiftKey) =>
                                toggleSelect(item.id, shiftKey)
                              }
                              onUpdate={updateItem}
                              onRemove={removeItem}
                              isSelectionMode={isSelectionMode}
                              portfolioId={activePortfolioId}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {portfolios.length === 0 && !loading && (
            <EstadoVazio
              icon={Package}
              titulo="Nenhum portfólio criado"
              descricao="Crie seu primeiro portfólio para começar a rastrear sua coleção de cartas."
            >
              <BotaoFoil onClick={openNewPortfolioOrPaywall}>
                <FolderPlus />
                Criar portfólio
              </BotaoFoil>
            </EstadoVazio>
          )}

          {/* New Portfolio Dialog */}
          <DialogoNovoPortfolio
            open={showNewDialog}
            onOpenChange={setShowNewDialog}
            onCriado={async (p) => {
              await invalidateCollection();
              setActivePortfolioId(p.id);
            }}
          />

          <ProUpgradeModal
            open={proModalOpen}
            onClose={() => setProModalOpen(false)}
          />

          {/* Bulk Action Dialog */}
          <Dialog
            open={bulkAction !== null}
            onOpenChange={(open) => !open && setBulkAction(null)}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {bulkPhase === "done"
                    ? "Operação concluída"
                    : bulkPhase === "progress"
                      ? "Processando..."
                      : bulkPhase === "new_portfolio"
                        ? "Novo Portfólio"
                        : bulkAction === "delete"
                          ? "Excluir cartas em lote"
                          : bulkAction === "copy"
                            ? "Copiar cartas em lote"
                            : "Mover cartas em lote"}
                </DialogTitle>
                <DialogDescription>
                  {bulkPhase === "done" ? (
                    bulkAction === "delete" ? (
                      `${selectedIds.size} ${selectedIds.size === 1 ? "carta foi excluída" : "cartas foram excluídas"} com sucesso.`
                    ) : bulkAction === "copy" ? (
                      `${selectedIds.size} ${selectedIds.size === 1 ? "carta foi copiada" : "cartas foram copiadas"} com sucesso.`
                    ) : (
                      `${selectedIds.size} ${selectedIds.size === 1 ? "carta foi movida" : "cartas foram movidas"} com sucesso.`
                    )
                  ) : bulkPhase === "progress" ? (
                    "Aguarde enquanto as alterações são aplicadas..."
                  ) : bulkPhase === "new_portfolio" ? (
                    "Crie um novo portfólio para receber as cartas selecionadas."
                  ) : (
                    <>
                      {bulkAction === "delete" &&
                        `Você está prestes a excluir ${selectedIds.size} ${selectedIds.size === 1 ? "carta" : "cartas"}. Essa ação não pode ser desfeita.`}
                      {bulkAction === "copy" &&
                        `Escolha o portfólio de destino para copiar as ${selectedIds.size} ${selectedIds.size === 1 ? "carta selecionada" : "cartas selecionadas"}.`}
                      {bulkAction === "move" &&
                        `As ${selectedIds.size} ${selectedIds.size === 1 ? "carta selecionada será movida" : "cartas selecionadas serão movidas"} para o portfólio de destino e retiradas deste.`}
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>

              {/* Phase 1: Target Selection */}
              {bulkPhase === "select" && (
                <div className="space-y-4 py-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Selecionar Portfólio
                  </p>
                  <div className="max-h-60 overflow-y-auto border border-border rounded-lg divide-y divide-border">
                    {portfolios
                      .filter((p) => p.id !== activePortfolioId)
                      .map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setBulkTargetId(p.id)}
                          className={cn(
                            "w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-muted/40 transition-colors cursor-pointer",
                            bulkTargetId === p.id &&
                              "bg-primary/5 text-primary",
                          )}
                        >
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {p._count?.items ?? 0} cartas
                            </p>
                          </div>
                          {bulkTargetId === p.id && (
                            <Check className="size-4 text-primary" />
                          )}
                        </button>
                      ))}
                    {portfolios.filter((p) => p.id !== activePortfolioId)
                      .length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        Nenhum outro portfólio disponível.
                      </p>
                    )}
                  </div>
                  <DialogFooter className="flex flex-row items-center justify-between gap-2 sm:justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const isPro =
                          stats?.isPro ??
                          (session?.user as { isPro?: boolean } | undefined)
                            ?.isPro ??
                          false;
                        if (!isPro && portfolios.length >= 5) {
                          setProModalOpen(true);
                        } else {
                          setBulkPhase("new_portfolio");
                        }
                      }}
                      className="gap-1.5 text-xs text-primary hover:text-primary cursor-pointer"
                    >
                      <FolderPlus className="size-4" />
                      Novo Portfólio
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBulkAction(null)}
                      >
                        <X className="size-4" />
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setBulkPhase("confirm")}
                        disabled={!bulkTargetId}
                        className="bg-primary hover:bg-primary/95 text-white"
                      >
                        Continuar
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </DialogFooter>
                </div>
              )}

              {/* Phase 1.5: Create Target Portfolio */}
              {bulkPhase === "new_portfolio" && (
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Nome do portfólio
                    </label>
                    <Input
                      autoFocus
                      value={newBulkPortfolioName}
                      onChange={(e) => setNewBulkPortfolioName(e.target.value)}
                      placeholder="Ex: Minha coleção Pokémon"
                      disabled={creatingBulkPortfolio}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateBulkPortfolio();
                        }
                      }}
                    />
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setBulkPhase("select")}
                      disabled={creatingBulkPortfolio}
                    >
                      <ChevronLeft className="size-4" />
                      Voltar
                    </Button>
                    <Button
                      onClick={handleCreateBulkPortfolio}
                      disabled={
                        creatingBulkPortfolio || !newBulkPortfolioName.trim()
                      }
                      className="bg-primary hover:bg-primary/95 text-white"
                    >
                      {creatingBulkPortfolio ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <FolderPlus className="size-4" />
                      )}
                      Criar e Continuar
                    </Button>
                  </DialogFooter>
                </div>
              )}

              {/* Phase 2: Confirmation */}
              {bulkPhase === "confirm" && (
                <div className="space-y-4 py-2">
                  <p className="text-sm text-muted-foreground">
                    {bulkAction === "delete" &&
                      `Tem certeza que deseja excluir permanentemente essas ${selectedIds.size} cartas?`}
                    {bulkAction === "copy" &&
                      `Confirmar a cópia de ${selectedIds.size} cartas para o portfólio "${portfolios.find((p) => p.id === bulkTargetId)?.name}"?`}
                    {bulkAction === "move" &&
                      `Confirmar a transferência de ${selectedIds.size} cartas para o portfólio "${portfolios.find((p) => p.id === bulkTargetId)?.name}"?`}
                  </p>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setBulkPhase(
                          bulkAction === "delete" ? "confirm" : "select",
                        )
                      }
                    >
                      {bulkAction === "delete" ? (
                        <X className="size-4" />
                      ) : (
                        <ChevronLeft className="size-4" />
                      )}
                      {bulkAction === "delete" ? "Cancelar" : "Voltar"}
                    </Button>
                    <Button
                      onClick={executeBulkAction}
                      variant={
                        bulkAction === "delete" ? "destructive" : "default"
                      }
                      className="rounded-full px-5 text-sm font-bold"
                    >
                      {bulkAction === "delete" && <Trash2 className="size-4" />}
                      {bulkAction === "copy" && <Copy className="size-4" />}
                      {bulkAction === "move" && (
                        <ArrowRight className="size-4" />
                      )}
                      Confirmar e Executar
                    </Button>
                  </DialogFooter>
                </div>
              )}

              {/* Phase 3: Progress & Done */}
              {(bulkPhase === "progress" || bulkPhase === "done") && (
                <div className="space-y-4 py-2">
                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">
                        {bulkPhase === "progress"
                          ? "Processando cartas..."
                          : "Concluído!"}
                      </span>
                      <span className="font-mono">
                        {
                          Object.values(bulkStatus).filter(
                            (s) => s !== "pending",
                          ).length
                        }{" "}
                        / {selectedIds.size}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{
                          width: `${(Object.values(bulkStatus).filter((s) => s !== "pending").length / selectedIds.size) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Status List */}
                  <div className="max-h-60 overflow-y-auto border border-border rounded-lg divide-y divide-border px-3 py-1 bg-background/50">
                    {items
                      .filter((item) => selectedIds.has(item.id))
                      .map((item) => {
                        const status = bulkStatus[item.id] ?? "pending";
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-2 text-xs"
                          >
                            <span className="font-medium text-foreground truncate max-w-[70%]">
                              {cardName(item.card)}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {status === "pending" && (
                                <Loader2 className="size-3.5 text-muted-foreground animate-spin" />
                              )}
                              {status === "done" && (
                                <span className="text-emerald-500 font-bold">
                                  ✓ Pronto
                                </span>
                              )}
                              {status === "error" && (
                                <span className="text-red-500 font-bold">
                                  ✗ Erro
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {bulkPhase === "done" && (
                    <DialogFooter>
                      <Button
                        onClick={finishBulkAction}
                        className="bg-primary hover:bg-primary/95 text-white w-full"
                      >
                        <Check className="size-4" />
                        Concluído
                      </Button>
                    </DialogFooter>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      )}
    </>
  );
}
