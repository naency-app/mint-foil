"use client";

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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import {
  api,
  type CollectionItem,
  type CollectionResponse,
  type Portfolio,
  type PortfolioMetrics,
} from "@/lib/api";
import {
  ArrowUpDown,
  DollarSign,
  FolderPlus,
  Loader2,
  Minus,
  Package,
  Plus,
  TrendingDown,
  TrendingUp,
  Trash2,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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
    <Card className="bg-card/50 backdrop-blur-sm border-border">
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
  onUpdate,
  onRemove,
}: {
  item: CollectionItem;
  onUpdate: (id: string, data: { quantity: number }) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const currentPrice = item.card.prices[0]?.value ?? 0;
  const totalValue = currentPrice * item.quantity;
  const invested = (item.buyPrice ?? 0) * item.quantity;
  const profit = totalValue - invested;
  const isPositive = profit >= 0;
  const [removing, setRemoving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
      <div className="flex items-center gap-4 px-4 py-3 rounded-lg border border-border bg-card hover:bg-background/50 transition-all group">
        <Link
          href={`/card/${item.card.id}`}
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
          <Link href={`/card/${item.card.id}`}>
            <h3 className="text-sm font-semibold text-foreground truncate hover:text-emerald-400 transition-colors">
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

        <div className="hidden sm:flex items-center gap-0">
          <button
            type="button"
            onClick={() => handleQuantityChange(-1)}
            className="size-7 rounded-l-md border border-border bg-muted hover:bg-accent text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
          >
            <Minus className="size-3" />
          </button>
          <div className="h-7 px-2.5 border-y border-border bg-muted/50 flex items-center justify-center min-w-[32px]">
            <span className="text-xs font-mono text-foreground font-bold">
              {item.quantity}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleQuantityChange(1)}
            className="size-7 rounded-r-md border border-border bg-muted hover:bg-accent text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
          >
            <Plus className="size-3" />
          </button>
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

        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="shrink-0 size-8 rounded-full text-muted-foreground hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover da coleção?</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover{" "}
              <strong>{item.card.name}</strong> da sua coleção? Esta ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={removing}
            >
              {removing ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="size-4 mr-2" />
              )}
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function PortfolioPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

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

  const fetchPortfolios = useCallback(async () => {
    try {
      const data = await api.collection.portfolios();
      setPortfolios(data);
      if (data.length > 0 && !activePortfolioId) {
        setActivePortfolioId(data[0].id);
      }
    } catch {
      /* ignore for now */
    }
  }, [activePortfolioId]);

  const fetchPortfolioItems = useCallback(async (portfolioId: string) => {
    setLoading(true);
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
      await api.collection.update(id, data);
      if (activePortfolioId) fetchPortfolioItems(activePortfolioId);
    },
    [activePortfolioId, fetchPortfolioItems],
  );

  const removeItem = useCallback(
    async (id: string) => {
      await api.collection.remove(id);
      if (activePortfolioId) fetchPortfolioItems(activePortfolioId);
    },
    [activePortfolioId, fetchPortfolioItems],
  );

  if (sessionLoading) {
    return (
      <main className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </main>
    );
  }

  if (!session?.user) return null;

  const totalCards = items.reduce((acc, item) => acc + item.quantity, 0);
  const activePortfolio = portfolios.find((p) => p.id === activePortfolioId);

  return (
    <main className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meus Portfólios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {portfolios.length} portfólio{portfolios.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={() => setShowNewDialog(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold gap-2"
        >
          <FolderPlus className="size-4" />
          Novo Portfólio
        </Button>
      </div>

      {/* Portfolio Tabs */}
      {portfolios.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {portfolios.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePortfolioId(p.id)}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                p.id === activePortfolioId
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {p.name}
              {p._count && (
                <span className="ml-1.5 text-xs opacity-60">
                  ({p._count.items})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {activePortfolio && (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Valor Estimado"
              value={metrics.currentEstimatedValue}
              icon={Wallet}
              color="bg-emerald-500/15 text-emerald-400"
            />
            <MetricCard
              label="Total Investido"
              value={metrics.totalInvested}
              icon={DollarSign}
              color="bg-blue-500/15 text-blue-400"
            />
            <MetricCard
              label="Lucro / Prejuízo"
              value={metrics.profitOrLoss}
              icon={metrics.profitOrLoss >= 0 ? TrendingUp : TrendingDown}
              color={
                metrics.profitOrLoss >= 0
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-red-500/15 text-red-400"
              }
            />
            <MetricCard
              label="ROI"
              value={metrics.roi}
              icon={ArrowUpDown}
              color="bg-purple-500/15 text-purple-400"
              prefix=""
              suffix="%"
            />
          </div>

          <Separator />

          {/* Collection Items */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
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
              <p className="text-xs text-muted-foreground">
                {totalCards} {totalCards === 1 ? "carta" : "cartas"} em &quot;
                {activePortfolio.name}&quot;
              </p>
              <div className="space-y-2">
                {items.map((item) => (
                  <PortfolioItemRow
                    key={item.id}
                    item={item}
                    onUpdate={updateItem}
                    onRemove={removeItem}
                  />
                ))}
              </div>
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
            onClick={() => setShowNewDialog(true)}
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
            <Button
              variant="outline"
              onClick={() => setShowNewDialog(false)}
            >
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
    </main>
  );
}
