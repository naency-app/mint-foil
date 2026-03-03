"use client";

import { Button } from "@/components/ui/button";
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
import {
  IconCheck,
  IconLoader2,
  IconMinus,
  IconPlus,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { sileo } from "sileo";

const CONDITIONS = [
  { value: "NM", label: "Near Mint (NM)" },
  { value: "LP", label: "Light Play (LP)" },
  { value: "MP", label: "Moderately Played (MP)" },
  { value: "HP", label: "Heavily Played (HP)" },
  { value: "DMG", label: "Damaged (DMG)" },
];

interface AddToPortfolioButtonProps {
  cardId: string;
  defaultPortfolioId?: string;
  triggerClassName?: string;
}

export function AddToPortfolioButton({
  cardId,
  defaultPortfolioId,
  triggerClassName,
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

  useEffect(() => {
    if (defaultPortfolioId) setSelectedPortfolioId(defaultPortfolioId);
  }, [defaultPortfolioId]);

  useEffect(() => {
    if (!open || portfolios.length > 0) return;
    setPortfoliosLoading(true);
    api.collection
      .portfolios()
      .then((data) => {
        setPortfolios(data);
        if (!selectedPortfolioId && data.length > 0) {
          setSelectedPortfolioId(data[0].id);
        }
      })
      .catch(() => sileo.error({ title: "Erro ao carregar portfólios" }))
      .finally(() => setPortfoliosLoading(false));
  }, [open]);

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
      ("");
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          className={
            triggerClassName ??
            "absolute bottom-2 right-2 z-10 size-7 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          }
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {success ? (
            <IconCheck className="size-3.5" />
          ) : (
            <IconPlus className="size-3.5" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-3 space-y-3" side="top" align="end">
        <p className="text-xs font-semibold text-foreground">
          Adicionar ao Portfólio
        </p>

        {portfoliosLoading ? (
          <div className="flex items-center justify-center py-4">
            <IconLoader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : portfolios.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">
            Nenhum portfólio encontrado.
          </p>
        ) : (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
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
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Condição
              </label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem
                      key={c.value}
                      value={c.value}
                      className="text-xs"
                    >
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Quantidade
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="size-7 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                >
                  <IconMinus className="size-3" />
                </button>
                <span className="flex-1 text-center text-sm font-mono font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="size-7 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                >
                  <IconPlus className="size-3" />
                </button>
              </div>
            </div>

            <Button
              size="sm"
              className="w-full h-8 text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold cursor-pointer"
              onClick={handleAdd}
              disabled={loading || success || !selectedPortfolioId}
            >
              {loading && (
                <IconLoader2 className="size-3.5 animate-spin mr-1" />
              )}
              {success && <IconCheck className="size-3.5 mr-1" />}
              {success ? "Adicionado!" : "Adicionar"}
            </Button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
