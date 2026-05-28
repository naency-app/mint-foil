"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, type Portfolio } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  IconCheck,
  IconFolderPlus,
  IconLoader2,
  IconMinus,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { sileo } from "sileo";

const CONDITIONS = [
  { value: "NM", label: "Near Mint" },
  { value: "LP", label: "Light Play" },
  { value: "MP", label: "Mod. Played" },
  { value: "HP", label: "Heavily Played" },
  { value: "DMG", label: "Damaged" },
];

interface AddToPortfolioButtonProps {
  cardId: string;
  defaultPortfolioId?: string;
  triggerClassName?: string;
  onSuccess?: () => void;
}

export function AddToPortfolioButton({
  cardId,
  defaultPortfolioId,
  triggerClassName,
  onSuccess,
}: AddToPortfolioButtonProps) {
  const [open, setOpen] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(
    defaultPortfolioId ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState("NM");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [portfoliosLoading, setPortfoliosLoading] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const [creatingPortfolio, setCreatingPortfolio] = useState(false);
  const qtyDelta = useRef(0);

  useEffect(() => {
    if (defaultPortfolioId) setSelectedPortfolioId(defaultPortfolioId);
  }, [defaultPortfolioId]);

  useEffect(() => {
    if (!open || portfolios.length > 0) return;
    setPortfoliosLoading(true);
    api.collection
      .portfolios()
      .then((data) => {
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

        if (!selectedPortfolioId && sortedPortfolios.length > 0) {
          const foundFav = sortedPortfolios.find((p) => favs.includes(p.id));
          const oldDefault = localStorage.getItem("minty_default_portfolio_id");
          const hasOldStored = sortedPortfolios.some(
            (p) => p.id === oldDefault,
          );

          setSelectedPortfolioId(
            foundFav
              ? foundFav.id
              : hasOldStored && oldDefault
                ? oldDefault
                : sortedPortfolios[0].id,
          );
        }
      })
      .catch(() => sileo.error({ title: "Erro ao carregar portfólios" }))
      .finally(() => setPortfoliosLoading(false));
  }, [open]);

  function decQty() {
    if (quantity <= 1) return;
    qtyDelta.current = -1;
    setQuantity((q) => Math.max(1, q - 1));
  }

  function incQty() {
    qtyDelta.current = 1;
    setQuantity((q) => q + 1);
  }

  async function handleCreatePortfolio() {
    if (!newPortfolioName.trim() || creatingPortfolio) return;
    setCreatingPortfolio(true);
    try {
      const p = await api.collection.createPortfolio(newPortfolioName.trim());
      setPortfolios((prev) => [...prev, p]);
      setSelectedPortfolioId(p.id);
      setShowNewDialog(false);
      setNewPortfolioName("");
      sileo.success({ title: `Portfólio "${p.name}" criado!` });
    } catch {
      sileo.error({ title: "Erro ao criar portfólio" });
    } finally {
      setCreatingPortfolio(false);
    }
  }

  async function handleAdd() {
    if (!selectedPortfolioId || loading) return;
    setLoading(true);
    try {
      await api.collection.add({
        cardId,
        quantity,
        condition,
        portfolioId: selectedPortfolioId,
      });
      setSuccess(true);
      if (onSuccess) onSuccess();
      const portfolio = portfolios.find((p) => p.id === selectedPortfolioId);
      sileo.success({
        title: `Adicionado ao portfólio "${portfolio?.name ?? ""}"`,
      });
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
        setQuantity(1);
      }, 1200);
    } catch {
      sileo.error({ title: "Erro ao adicionar carta" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            className={
              triggerClassName ??
              "absolute bottom-2 right-2 z-10 size-7 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            }
            onClick={(e) => e.stopPropagation()}
          >
            {success ? (
              <IconCheck className="size-3.5" />
            ) : (
              <IconPlus className="size-3.5" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-72 p-4 space-y-4" side="top" align="end">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <IconFolderPlus className="size-3.5 text-primary" />
            </div>
            <p className="text-xs font-semibold text-foreground">
              Adicionar ao Portfólio
            </p>
          </div>

          {portfoliosLoading ? (
            <div className="flex items-center justify-center py-6">
              <IconLoader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : portfolios.length === 0 ? (
            <div className="text-center py-4 space-y-2">
              <p className="text-xs text-muted-foreground">
                Nenhum portfólio encontrado.
              </p>
              <button
                type="button"
                onClick={() => setShowNewDialog(true)}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer mx-auto"
              >
                <IconFolderPlus className="size-3.5" />
                Criar portfólio
              </button>
            </div>
          ) : (
            <>
              {/* Portfolio */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Portfólio
                </label>
                <Select
                  value={selectedPortfolioId}
                  onValueChange={setSelectedPortfolioId}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecionar portfólio" />
                  </SelectTrigger>
                  <SelectContent>
                    {portfolios.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">
                        {p.name}
                        {p._count != null ? ` (${p._count.items})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => setShowNewDialog(true)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  <IconFolderPlus className="size-3" />
                  Novo portfólio
                </button>
              </div>

              {/* Condition chips */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Condição
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCondition(c.value)}
                      className={cn(
                        "px-2 py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer",
                        condition === c.value
                          ? "bg-primary/10 border-primary/50 text-primary"
                          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                      )}
                    >
                      {c.value}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground/70">
                  {CONDITIONS.find((c) => c.value === condition)?.label}
                </p>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Quantidade
                </label>
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.78 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    onClick={decQty}
                    disabled={quantity <= 1}
                    className="size-7 rounded-full border border-border bg-card hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive text-muted-foreground flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <IconMinus className="size-3" strokeWidth={2.5} />
                  </motion.button>

                  <div className="flex-1 flex items-center justify-center overflow-hidden h-7">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={quantity}
                        initial={{
                          y: qtyDelta.current > 0 ? 10 : -10,
                          opacity: 0,
                        }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{
                          y: qtyDelta.current > 0 ? -10 : 10,
                          opacity: 0,
                        }}
                        transition={{ duration: 0.13 }}
                        className="text-sm font-bold text-foreground font-mono tabular-nums"
                      >
                        {quantity}
                      </motion.span>
                    </AnimatePresence>
                  </div>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.78 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    onClick={incQty}
                    className="size-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <IconPlus className="size-3" strokeWidth={2.5} />
                  </motion.button>
                </div>
              </div>

              {/* Add button */}
              <Button
                size="sm"
                className="w-full gap-1.5 font-semibold"
                onClick={handleAdd}
                disabled={loading || success || !selectedPortfolioId}
              >
                {loading ? (
                  <IconLoader2 className="size-3.5 animate-spin" />
                ) : success ? (
                  <IconCheck className="size-3.5" />
                ) : (
                  <IconPlus className="size-3.5" />
                )}
                {success ? "Adicionado!" : "Adicionar à coleção"}
              </Button>
            </>
          )}
        </PopoverContent>
      </Popover>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Novo Portfólio</DialogTitle>
            <DialogDescription>
              Dê um nome para seu portfólio. Contas gratuitas podem ter até 5
              portfólios.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newPortfolioName}
            onChange={(e) => setNewPortfolioName(e.target.value)}
            placeholder="Ex: Minha coleção Pokémon"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreatePortfolio();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              <IconX className="size-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleCreatePortfolio}
              disabled={creatingPortfolio || !newPortfolioName.trim()}
            >
              {creatingPortfolio ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconFolderPlus className="size-4" />
              )}
              Criar portfólio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
