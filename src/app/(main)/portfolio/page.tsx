"use client";

import { IconLayoutGrid, IconListDetails } from "@tabler/icons-react";
import {
  ArrowRight,
  ArrowUpDown,
  Check,
  ChevronLeft,
  Copy,
  DollarSign,
  FolderPlus,
  Loader2,
  Minus,
  Package,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AddToPortfolioButton } from "@/app/components/AddToPortfolioButton";
import { ProUpgradeModal } from "@/app/components/ProUpgradeModal";
import { Area } from "@/components/charts/area";
import { AreaChart } from "@/components/charts/area-chart";
import Grid from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  api,
  type CollectionItem,
  type Portfolio,
  type PortfolioMetrics,
} from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

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
    <Card className="glass-card">
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
  onSelectToggle: () => void;
  onUpdate: (id: string, data: { quantity: number }) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  isSelectionMode: boolean;
  portfolioId: string | null;
}) {
  const [optimisticQty, setOptimisticQty] = useState(item.quantity);
  const lastDelta = useRef(0);
  const [removing, setRemoving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Keep local qty in sync if parent changes from elsewhere (e.g. rollback)
  useEffect(() => {
    setOptimisticQty(item.quantity);
  }, [item.quantity]);

  const currentPrice = item.card.prices[0]?.value ?? 0;
  const totalValue = currentPrice * optimisticQty;
  const invested = (item.buyPrice ?? 0) * optimisticQty;
  const profit = totalValue - invested;
  const isPositive = profit >= 0;

  async function handleQuantityChange(delta: number) {
    const newQty = optimisticQty + delta;
    if (newQty < 1) {
      setConfirmDelete(true);
      return;
    }
    lastDelta.current = delta;
    setOptimisticQty(newQty);
    try {
      await onUpdate(item.id, { quantity: newQty });
    } catch {
      setOptimisticQty(optimisticQty);
      toast.error("Erro ao atualizar quantidade");
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      await onRemove(item.id);
      toast.success(`${item.card.name} removido da coleção`);
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
            onSelectToggle();
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
        {/* Selection Checkbox */}
        {isSelectionMode && (
          <div
            className="shrink-0 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelectToggle();
              }}
              className="size-4.5 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
            />
          </div>
        )}
        <Link
          href={
            portfolioId
              ? `/card/${item.card.id}?portfolioId=${portfolioId}`
              : `/card/${item.card.id}`
          }
          onClick={(e) => {
            if (isSelectionMode) {
              e.preventDefault();
              e.stopPropagation();
              onSelectToggle();
            }
          }}
          className="shrink-0 size-14 rounded-md overflow-hidden"
        >
          <Image
            src={item.card.imageUrl}
            alt={item.card.name}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={
              portfolioId
                ? `/card/${item.card.id}?portfolioId=${portfolioId}`
                : `/card/${item.card.id}`
            }
            onClick={(e) => {
              if (isSelectionMode) {
                e.preventDefault();
                e.stopPropagation();
                onSelectToggle();
              }
            }}
          >
            <h3 className="text-sm font-semibold text-foreground truncate hover:text-primary transition-colors">
              {item.card.name}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground truncate">
            {item.card.setName ?? item.card.setCode} • {item.card.rarity}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[9px] h-4 px-1.5">
              {item.condition}
            </Badge>
            {item.buyPrice != null && (
              <span className="text-[10px] text-muted-foreground font-mono">
                Compra: R$ {formatPrice(item.buyPrice)}
              </span>
            )}
          </div>
        </div>

        <div
          className="hidden sm:flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            type="button"
            whileTap={{ scale: 0.78 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            onClick={(e) => {
              e.stopPropagation();
              handleQuantityChange(-1);
            }}
            className="size-7 rounded-full border border-border bg-card hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive text-muted-foreground flex items-center justify-center transition-colors cursor-pointer"
          >
            <Minus className="size-3" strokeWidth={2.5} />
          </motion.button>

          <div className="w-7 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={optimisticQty}
                initial={{ y: lastDelta.current > 0 ? 10 : -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: lastDelta.current > 0 ? -10 : 10, opacity: 0 }}
                transition={{ duration: 0.13 }}
                className="text-sm font-bold text-foreground font-mono"
              >
                {optimisticQty}
              </motion.span>
            </AnimatePresence>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.78 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            onClick={(e) => {
              e.stopPropagation();
              handleQuantityChange(1);
            }}
            className="size-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-colors cursor-pointer"
          >
            <Plus className="size-3" strokeWidth={2.5} />
          </motion.button>
        </div>

        <div className="text-right shrink-0 w-32">
          <div className="flex items-center justify-end gap-1">
            <span className="text-sm font-bold text-foreground font-mono">
              R$ {formatPrice(totalValue)}
            </span>
          </div>
          <div className="flex items-center justify-end gap-1">
            {isPositive ? (
              <TrendingUp className="size-2.5 text-emerald-400" />
            ) : (
              <TrendingDown className="size-2.5 text-red-400" />
            )}
            <span
              className={`text-[10px] font-mono ${isPositive ? "text-emerald-400" : "text-red-400"}`}
            >
              {isPositive ? "+" : ""}R$ {formatPrice(profit)}
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
            className="size-8 rounded-full text-muted-foreground hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all cursor-pointer"
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
              Tem certeza que deseja remover <strong>{item.card.name}</strong>{" "}
              da sua coleção? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(false);
              }}
            >
              <X className="size-4" />
              Cancelar
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              disabled={removing}
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
  onSelectToggle: () => void;
  onUpdate: (id: string, data: { quantity: number }) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  isSelectionMode: boolean;
  portfolioId: string | null;
}) {
  const currentPrice = item.card.prices[0]?.value ?? 0;
  const totalValue = currentPrice * item.quantity;
  const invested = (item.buyPrice ?? 0) * item.quantity;
  const profit = totalValue - invested;
  const isPositive = profit >= 0;
  const [removing, setRemoving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleRemove() {
    setRemoving(true);
    try {
      await onRemove(item.id);
      toast.success(`${item.card.name} removido da coleção`);
    } catch {
      toast.error("Erro ao remover item");
    } finally {
      setRemoving(false);
      setConfirmDelete(false);
    }
  }

  async function handleQuantityChange(delta: number) {
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      setConfirmDelete(true);
      return;
    }
    try {
      await onUpdate(item.id, { quantity: newQty });
    } catch {
      toast.error("Erro ao atualizar quantidade");
    }
  }

  return (
    <>
      <Card
        onClick={(e) => {
          if (isSelectionMode) {
            e.preventDefault();
            e.stopPropagation();
            onSelectToggle();
          }
        }}
        className={cn(
          "group w-full h-full overflow-hidden dark:border dark:border-slate-800 bg-card backdrop-blur-sm hover:bg-background/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 py-0 relative",
          isSelected &&
            isSelectionMode &&
            "ring-2 ring-primary border-transparent bg-primary/5",
          isSelectionMode && "cursor-pointer select-none",
        )}
      >
        {/* Checkbox overlay */}
        {isSelectionMode && (
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className={cn(
              "absolute top-3 left-3 z-20 flex items-center justify-center p-1 bg-background/95 border border-border/80  rounded-md shadow-md",
            )}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelectToggle();
              }}
              className="size-4 rounded-md border-border text-primary focus:ring-primary cursor-pointer accent-primary"
            />
          </div>
        )}
        <CardContent className="p-0 flex-1 relative">
          <Link
            href={
              portfolioId
                ? `/card/${item.card.id}?portfolioId=${portfolioId}`
                : `/card/${item.card.id}`
            }
            onClick={(e) => {
              if (isSelectionMode) {
                e.preventDefault();
                e.stopPropagation();
                onSelectToggle();
              }
            }}
            className="block overflow-hidden p-2"
          >
            <Image
              src={item.card.imageUrl}
              alt={item.card.name}
              className="w-full rounded-xl aspect-[5/7] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              width={200}
              height={200}
            />
          </Link>
          {/* Quantity badge */}
          {!isSelectionMode && (
            <div className="absolute top-3 right-3 bg-black/70 text-white text-[10px] font-bold rounded-full size-5 flex items-center justify-center">
              {item.quantity}
            </div>
          )}
          {!isSelectionMode && <AddToPortfolioButton cardId={item.card.id} />}
        </CardContent>

        <div className="p-3 space-y-1">
          <Link
            href={
              portfolioId
                ? `/card/${item.card.id}?portfolioId=${portfolioId}`
                : `/card/${item.card.id}`
            }
            onClick={(e) => {
              if (isSelectionMode) {
                e.preventDefault();
                e.stopPropagation();
                onSelectToggle();
              }
            }}
          >
            <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-2 min-h-[3.1rem] hover:text-primary transition-colors">
              {item.card.name}
            </h3>
          </Link>
          {item.card.setName && (
            <p className="text-xs text-tertiary truncate leading-tight">
              {item.card.setName}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground leading-tight">
            {item.card.rarity
              ? `${item.card.rarity} • ${item.card.setCode}`
              : item.card.setCode}
          </p>

          <div className="pt-1.5 border-t border-border space-y-2">
            {/* Price & profit / cost */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground font-mono">
                  R$ {formatPrice(totalValue)}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  ({item.quantity}x R$ {formatPrice(currentPrice)})
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted-foreground">
                  Custo: R$ {formatPrice(invested)}
                </span>
                <div className="flex items-center gap-1">
                  {isPositive ? (
                    <TrendingUp className="size-3 text-emerald-400 shrink-0" />
                  ) : (
                    <TrendingDown className="size-3 text-red-400 shrink-0" />
                  )}
                  <span
                    className={isPositive ? "text-emerald-400" : "text-red-400"}
                  >
                    {isPositive ? "+" : ""}R$ {formatPrice(profit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity control */}
            <div
              className="flex items-center justify-between gap-1 pt-1"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(-1);
                  }}
                  className="size-7 rounded-l-md border border-border bg-muted hover:bg-accent text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Minus className="size-3" />
                </button>
                <div className="h-7 px-3 border-y border-border bg-muted/50 flex items-center justify-center min-w-[32px]">
                  <span className="text-xs font-mono text-foreground font-bold">
                    {item.quantity}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(1);
                  }}
                  className="size-7 rounded-r-md border border-border bg-muted hover:bg-accent text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Plus className="size-3" />
                </button>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(true);
                }}
                className="size-7 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-red-500/20"
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
              Tem certeza que deseja remover <strong>{item.card.name}</strong>{" "}
              da sua coleção? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(false);
              }}
            >
              <X className="size-4" />
              Cancelar
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              disabled={removing}
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
    <main className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-20 mt-2" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      <div className="flex items-center gap-6 pb-1 border-b border-border -mx-4 px-4 sm:mx-0 sm:px-0">
        <Skeleton className="h-5 w-20 mb-1" />
        <Skeleton className="h-5 w-24 mb-1" />
        <Skeleton className="h-5 w-16 mb-1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 border border-border rounded-xl p-5 flex flex-col gap-4 min-h-[380px]">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-8 w-36" />
            </div>
            <Skeleton className="h-8 w-32 rounded-lg self-start" />
          </div>
          <Skeleton className="flex-1 rounded-xl min-h-[220px]" />
        </div>

        <div className="lg:col-span-4 border border-border rounded-xl p-5 flex flex-col justify-between min-h-[380px]">
          <div className="flex flex-col gap-0">
            <Skeleton className="h-3 w-44 mb-4" />
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-border/50"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="size-8 rounded-lg" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
          <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-36" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-36 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    </main>
  );
}

export default function PortfolioPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(
    null,
  );
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [metrics, setMetrics] = useState<PortfolioMetrics>(defaultMetrics);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);

  const [portfoliosLoaded, setPortfoliosLoaded] = useState(false);
  const [historyData, setHistoryData] = useState<
    { date: Date; value: number }[]
  >([]);
  const [historyRange, setHistoryRange] = useState<"7d" | "1m" | "3m" | "6m">(
    "1m",
  );
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const historyCache = useRef<Record<string, { date: Date; value: number }[]>>(
    {},
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

  const fetchHistory = useCallback(
    async (
      range: "7d" | "1m" | "3m" | "6m",
      portfolioId: string,
      forceRefresh = false,
    ) => {
      const cacheKey = `${portfolioId}:${range}`;
      const cached = historyCache.current[cacheKey];
      if (cached && !forceRefresh) {
        setHistoryData(cached);
        // Silent background update to keep data fresh without blocking UI
        api.collection
          .history(range, portfolioId)
          .then((data) => {
            const mapped = data.map((d) => ({
              date: new Date(d.date),
              value: d.value,
            }));
            historyCache.current[cacheKey] = mapped;
            setHistoryData(mapped);
          })
          .catch(() => {});
        return;
      }

      setHistoryLoading(true);
      try {
        const data = await api.collection.history(range, portfolioId);
        const mapped = data.map((d) => ({
          date: new Date(d.date),
          value: d.value,
        }));
        historyCache.current[cacheKey] = mapped;
        setHistoryData(mapped);
      } catch {
        setHistoryData([]);
      } finally {
        setHistoryLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (session?.user && activePortfolioId) {
      fetchHistory(historyRange, activePortfolioId);
    }
  }, [session, historyRange, activePortfolioId, fetchHistory]);

  function openNewPortfolioOrPaywall() {
    if (portfolios.length >= 5) {
      setProModalOpen(true);
    } else {
      setShowNewDialog(true);
    }
  }

  const fetchPortfolios = useCallback(async () => {
    try {
      const data = await api.collection.portfolios();

      const favsStr = localStorage.getItem("minty_favorite_portfolio_ids");
      let favs: string[] = [];
      if (favsStr) {
        try {
          favs = JSON.parse(favsStr) as string[];
        } catch {}
      } else {
        const oldDefault = localStorage.getItem("minty_default_portfolio_id");
        if (oldDefault) favs = [oldDefault];
      }

      const sortedPortfolios = [...data].sort((a, b) => {
        const aFav = favs.includes(a.id);
        const bFav = favs.includes(b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return 0;
      });

      setPortfolios(sortedPortfolios);

      if (sortedPortfolios.length > 0 && !activePortfolioId) {
        const foundFav = sortedPortfolios.find((p) => favs.includes(p.id));
        if (foundFav) {
          setActivePortfolioId(foundFav.id);
        } else {
          const stored = localStorage.getItem("minty_default_portfolio_id");
          const hasStored = sortedPortfolios.some((p) => p.id === stored);
          setActivePortfolioId(
            hasStored && stored ? stored : sortedPortfolios[0].id,
          );
        }
      }
      if (sortedPortfolios.length === 0) setLoading(false);
    } catch {
      /* ignore for now */
    } finally {
      setPortfoliosLoaded(true);
    }
  }, [activePortfolioId]);

  const fetchPortfolioItems = useCallback(async (portfolioId: string) => {
    setLoading(true);
    setSelectedIds(new Set());
    try {
      const data = await api.collection.getPortfolio(portfolioId);
      setItems(data.items);
      setMetrics(data.metrics);
    } catch {
      setItems([]);
      setMetrics(defaultMetrics);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/login?redirect=/portfolio");
    }
  }, [session, sessionLoading, router]);

  useEffect(() => {
    if (session?.user) {
      fetchPortfolios();
    }
  }, [session, fetchPortfolios]);

  useEffect(() => {
    if (activePortfolioId) {
      fetchPortfolioItems(activePortfolioId);
    }
  }, [activePortfolioId, fetchPortfolioItems]);

  async function handleCreatePortfolio() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const p = await api.collection.createPortfolio(newName.trim());
      setPortfolios((prev) => [...prev, p]);
      setActivePortfolioId(p.id);
      setShowNewDialog(false);
      setNewName("");
      toast.success(`Portfólio "${p.name}" criado!`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao criar portfólio",
      );
    } finally {
      setCreating(false);
    }
  }

  const updateItem = useCallback(
    async (id: string, data: { quantity: number }) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data } : item)),
      );
      try {
        await api.collection.update(id, data);
        if (activePortfolioId) {
          api.collection
            .getPortfolio(activePortfolioId)
            .then((d) => setMetrics(d.metrics))
            .catch(() => {});
          fetchHistory(historyRange, activePortfolioId, true);
        }
      } catch (err) {
        if (activePortfolioId) fetchPortfolioItems(activePortfolioId);
        throw err;
      }
    },
    [activePortfolioId, fetchPortfolioItems, fetchHistory, historyRange],
  );

  const removeItem = useCallback(
    async (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      try {
        await api.collection.remove(id);
        if (activePortfolioId) {
          api.collection
            .getPortfolio(activePortfolioId)
            .then((d) => setMetrics(d.metrics))
            .catch(() => {});
          fetchHistory(historyRange, activePortfolioId, true);
        }
      } catch {
        if (activePortfolioId) fetchPortfolioItems(activePortfolioId);
      }
    },
    [activePortfolioId, fetchPortfolioItems, fetchHistory, historyRange],
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<
    "copy" | "move" | "delete" | null
  >(null);
  const [bulkTargetId, setBulkTargetId] = useState<string>("");
  const [bulkPhase, setBulkPhase] = useState<
    "select" | "confirm" | "progress" | "done"
  >("select");
  const [bulkStatus, setBulkStatus] = useState<
    Record<string, "pending" | "done" | "error">
  >({});

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const openBulkAction = (action: "copy" | "move" | "delete") => {
    setBulkAction(action);
    setBulkPhase(action === "delete" ? "confirm" : "select");
    setBulkTargetId("");
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
    if (activePortfolioId) {
      fetchPortfolioItems(activePortfolioId);
      fetchHistory(historyRange, activePortfolioId);
    }
  };

  if (sessionLoading || (session?.user && !portfoliosLoaded)) {
    return <PortfolioPageSkeleton />;
  }

  if (!session?.user) return null;

  const totalCards = items.reduce((acc, item) => acc + item.quantity, 0);
  const activePortfolio = portfolios.find((p) => p.id === activePortfolioId);

  return (
    <main className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Meus Portfólios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {portfolios.length} portfólio{portfolios.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openNewPortfolioOrPaywall}>
          <FolderPlus className="size-4" />
          Novo Portfólio
        </Button>
      </div>

      {/* Portfolio Tabs */}
      {portfolios.length > 0 && (
        <div className="flex items-center gap-6 overflow-x-auto pb-1 border-b border-border -mx-4 px-4 sm:mx-0 sm:px-0">
          {portfolios.map((p) => {
            const active = p.id === activePortfolioId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePortfolioId(p.id)}
                className={cn(
                  "relative py-2.5 text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition-colors focus:outline-none shrink-0",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{p.name}</span>
                {p._count && (
                  <span className="text-xs opacity-60">({p._count.items})</span>
                )}
                {active && (
                  <motion.span
                    layoutId="portfolio-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {activePortfolio && (
        <>
          {/* Dashboard Metrics and Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Card: Value Chart (col-span-8) */}
            <Card className="lg:col-span-8 glass-card overflow-hidden p-5 flex flex-col justify-between min-h-[380px]">
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
                        <span className="text-2xl font-extrabold text-foreground font-mono">
                          R$ {formatPrice(metrics.currentEstimatedValue)}
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
              <div className="flex-1 w-full relative min-h-[220px]">
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
                        margin={{ top: 10, right: 10, bottom: 25, left: 10 }}
                        aspectRatio="2.8 / 1"
                        className="w-full h-full"
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
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        <TrendingUp className="size-10 text-muted-foreground/30 mb-2" />
                        <p className="text-sm text-muted-foreground font-medium">
                          Histórico em construção
                        </p>
                        <p className="text-xs text-muted-foreground/60 max-w-xs mt-1">
                          O gráfico de evolução histórica será desenhado à
                          medida que sua coleção for atualizada nos próximos
                          dias.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>

            {/* Right Card: Summary Metrics (col-span-4) */}
            <Card className="lg:col-span-4 glass-card p-5 flex flex-col justify-between min-h-[380px]">
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                  Resumo Geral do Portfólio
                </h3>
                <div className="space-y-4">
                  {/* Total Invested */}
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <DollarSign className="size-4" />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        Total Investido
                      </span>
                    </div>
                    {loading ? (
                      <Skeleton className="h-4 w-20" />
                    ) : (
                      <span className="text-sm font-bold text-foreground font-mono">
                        R$ {formatPrice(metrics.totalInvested)}
                      </span>
                    )}
                  </div>

                  {/* Lucro / Prejuizo */}
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "size-8 rounded-lg flex items-center justify-center",
                          metrics.profitOrLoss >= 0
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400",
                        )}
                      >
                        {metrics.profitOrLoss >= 0 ? (
                          <TrendingUp className="size-4" />
                        ) : (
                          <TrendingDown className="size-4" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        Lucro / Prejuízo
                      </span>
                    </div>
                    {loading ? (
                      <Skeleton className="h-4 w-20" />
                    ) : (
                      <span
                        className={cn(
                          "text-sm font-bold font-mono",
                          metrics.profitOrLoss >= 0
                            ? "text-emerald-400"
                            : "text-red-400",
                        )}
                      >
                        {metrics.profitOrLoss >= 0 ? "+" : ""}
                        R$ {formatPrice(metrics.profitOrLoss)}
                      </span>
                    )}
                  </div>

                  {/* ROI */}
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <ArrowUpDown className="size-4" />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        ROI (Retorno)
                      </span>
                    </div>
                    {loading ? (
                      <Skeleton className="h-4 w-20" />
                    ) : (
                      <span
                        className={cn(
                          "text-sm font-bold font-mono",
                          metrics.roi >= 0
                            ? "text-emerald-400"
                            : "text-red-400",
                        )}
                      >
                        {metrics.roi >= 0 ? "+" : ""}
                        {formatPrice(metrics.roi)}%
                      </span>
                    )}
                  </div>

                  {/* Total de Cartas */}
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                        <Package className="size-4" />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        Total de Cartas
                      </span>
                    </div>
                    {loading ? (
                      <Skeleton className="h-4 w-16" />
                    ) : (
                      <span className="text-sm font-bold text-foreground font-mono">
                        {totalCards}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Stats */}
              <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                {loading ? (
                  <>
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-32" />
                  </>
                ) : (
                  <>
                    <span>
                      Itens únicos:{" "}
                      <strong className="text-foreground">
                        {items.length}
                      </strong>
                    </span>
                    <span>
                      Última atualização:{" "}
                      <strong className="text-foreground">
                        {activePortfolio?.updatedAt
                          ? new Date(
                              activePortfolio.updatedAt,
                            ).toLocaleDateString("pt-BR")
                          : "Hoje"}
                      </strong>
                    </span>
                  </>
                )}
              </div>
            </Card>
          </div>

          <Separator />

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
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Package className="size-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Portfólio vazio
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Explore o catálogo e adicione cartas a este portfólio.
              </p>
              <Button
                asChild
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold gap-2"
              >
                <Link href="/explore">
                  <Plus className="size-4" />
                  Explorar Cartas
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between animate-in fade-in duration-300">
                <p className="text-xs text-muted-foreground">
                  {totalCards} {totalCards === 1 ? "carta" : "cartas"} em &quot;
                  {activePortfolio.name}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant={isSelectionMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (isSelectionMode) {
                        setSelectedIds(new Set());
                      }
                      setIsSelectionMode(!isSelectionMode);
                    }}
                    className={cn(
                      "h-8 px-3 rounded-lg text-xs gap-1.5 cursor-pointer font-semibold transition-all",
                      isSelectionMode
                        ? "bg-primary text-primary-foreground hover:bg-primary/95"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Check className="size-3.5" />
                    {isSelectionMode ? `Sair da Seleção` : "Selecionar Vários"}
                  </Button>

                  <div className="flex items-center gap-1">
                    <GlassPill
                      active={viewType === "grid"}
                      onClick={() => setViewType("grid")}
                      className="px-2.5 py-1.5"
                      aria-label="Visualizar em grade"
                    >
                      <IconLayoutGrid className="size-4" />
                    </GlassPill>
                    <GlassPill
                      active={viewType === "list"}
                      onClick={() => setViewType("list")}
                      className="px-2.5 py-1.5"
                      aria-label="Visualizar em lista"
                    >
                      <IconListDetails className="size-4" />
                    </GlassPill>
                  </div>
                </div>
              </div>
              {viewType === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {items.map((item) => (
                    <PortfolioItemCard
                      key={item.id}
                      item={item}
                      isSelected={selectedIds.has(item.id)}
                      onSelectToggle={() => toggleSelect(item.id)}
                      onUpdate={updateItem}
                      onRemove={removeItem}
                      isSelectionMode={isSelectionMode}
                      portfolioId={activePortfolioId}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <PortfolioItemRow
                      key={item.id}
                      item={item}
                      isSelected={selectedIds.has(item.id)}
                      onSelectToggle={() => toggleSelect(item.id)}
                      onUpdate={updateItem}
                      onRemove={removeItem}
                      isSelectionMode={isSelectionMode}
                      portfolioId={activePortfolioId}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {portfolios.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="size-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Nenhum portfólio criado
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Crie seu primeiro portfólio para começar a rastrear sua coleção de
            cartas.
          </p>
          <Button
            onClick={openNewPortfolioOrPaywall}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold gap-2"
          >
            <FolderPlus className="size-4" />
            Criar Portfólio
          </Button>
        </div>
      )}

      {/* New Portfolio Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Portfólio</DialogTitle>
            <DialogDescription>
              Dê um nome para seu portfólio. Contas gratuitas podem ter até 5
              portfólios.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex: Minha coleção Pokémon"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreatePortfolio();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreatePortfolio}
              disabled={creating || !newName.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 text-black"
            >
              {creating ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <FolderPlus className="size-4 mr-2" />
              )}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProUpgradeModal
        open={proModalOpen}
        onClose={() => setProModalOpen(false)}
      />

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 glass-card !rounded-full border-primary/30 shadow-[0_0_30px_rgba(248,86,167,0.2)] px-6 py-3.5 flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-300">
          <span className="text-xs font-bold text-foreground whitespace-nowrap">
            {selectedIds.size}{" "}
            {selectedIds.size === 1 ? "item selecionado" : "itens selecionados"}
          </span>
          <Separator orientation="vertical" className="h-5 bg-border" />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => openBulkAction("copy")}
              className="text-xs gap-1.5 h-8 bg-muted hover:bg-muted/70 text-foreground border border-border transition-all cursor-pointer rounded-full px-3.5"
            >
              <Plus className="size-3.5" /> Copiar
            </Button>
            <Button
              size="sm"
              onClick={() => openBulkAction("move")}
              className="text-xs gap-1.5 h-8 bg-muted hover:bg-muted/70 text-foreground border border-border transition-all cursor-pointer rounded-full px-3.5"
            >
              <ArrowUpDown className="size-3.5" /> Mover
            </Button>
            <Button
              size="sm"
              onClick={() => openBulkAction("delete")}
              className="text-xs gap-1.5 h-8 bg-destructive/10 hover:bg-destructive text-destructive hover:text-white border border-destructive/30 transition-all cursor-pointer rounded-full px-3.5"
            >
              <Trash2 className="size-3.5" /> Excluir
            </Button>
          </div>
          <Separator orientation="vertical" className="h-5 bg-border" />
          <Button
            size="sm"
            onClick={() => setSelectedIds(new Set())}
            className="text-xs h-8 bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground border border-border cursor-pointer rounded-full px-4"
          >
            Limpar
          </Button>
        </div>
      )}

      {/* Bulk Action Dialog */}
      <Dialog
        open={bulkAction !== null}
        onOpenChange={(open) => !open && setBulkAction(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {bulkAction === "delete" && "Excluir cartas em lote"}
              {bulkAction === "copy" && "Copiar cartas em lote"}
              {bulkAction === "move" && "Mover cartas em lote"}
            </DialogTitle>
            <DialogDescription>
              {bulkAction === "delete" &&
                `Você está prestes a excluir ${selectedIds.size} cartas. Essa ação não pode ser desfeita.`}
              {bulkAction === "copy" &&
                `Escolha o portfólio de destino para copiar as ${selectedIds.size} cartas selecionadas.`}
              {bulkAction === "move" &&
                `As ${selectedIds.size} cartas selecionadas serão movidas para o portfólio de destino e retiradas deste.`}
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
                        bulkTargetId === p.id && "bg-primary/5 text-primary",
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
                {portfolios.filter((p) => p.id !== activePortfolioId).length ===
                  0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Nenhum outro portfólio disponível.
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBulkAction(null)}>
                  <X className="size-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={() => setBulkPhase("confirm")}
                  disabled={!bulkTargetId}
                  className="bg-primary hover:bg-primary/95 text-white"
                >
                  <ArrowRight className="size-4" />
                  Continuar
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
                    setBulkPhase(bulkAction === "delete" ? "confirm" : "select")
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
                  className={cn(
                    "text-white",
                    bulkAction === "delete"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-primary hover:bg-primary/95",
                  )}
                >
                  {bulkAction === "delete" && <Trash2 className="size-4" />}
                  {bulkAction === "copy" && <Copy className="size-4" />}
                  {bulkAction === "move" && <ArrowRight className="size-4" />}
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
                      Object.values(bulkStatus).filter((s) => s !== "pending")
                        .length
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
                          {item.card.name}
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
  );
}
