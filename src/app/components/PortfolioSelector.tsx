"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api, type Portfolio } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  Edit2,
  Folder,
  Loader2,
  Plus,
  Search,
  Star,
  Trash2,
  X
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface PortfolioSelectorProps {
  portfolios: Portfolio[];
  activePortfolioId: string;
  onSelect: (id: string) => void;
  onRefresh: () => void;
  labelPrefix?: string;
}

export function PortfolioSelector({
  portfolios,
  activePortfolioId,
  onSelect,
  onRefresh,
  labelPrefix = "Portfólio:",
}: PortfolioSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingMode, setIsAddingMode] = useState(false);

  const editInputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  // Local storage persistence for favorite portfolios
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("minty_favorite_portfolio_ids");
        if (stored) {
          setFavoriteIds(JSON.parse(stored));
        } else {
          const oldDefault = localStorage.getItem("minty_default_portfolio_id");
          if (oldDefault) {
            setFavoriteIds([oldDefault]);
          }
        }
      } catch {
        setFavoriteIds([]);
      }
    }
  }, []);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  useEffect(() => {
    if (isAddingMode && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAddingMode]);

  const activePortfolio = portfolios.find((p) => p.id === activePortfolioId) ?? portfolios[0];

  const filteredPortfolios = React.useMemo(() => {
    const list = portfolios.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    return [...list].sort((a, b) => {
      const aFav = favoriteIds.includes(a.id);
      const bFav = favoriteIds.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [portfolios, search, favoriteIds]);

  const handleToggleDefault = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    let nextFavorites: string[];
    const isFav = favoriteIds.includes(id);
    if (isFav) {
      nextFavorites = favoriteIds.filter((favId) => favId !== id);
      toast.success("Removido dos favoritos");
    } else {
      nextFavorites = [...favoriteIds, id];
      toast.success("Adicionado aos favoritos!");
      if (id !== activePortfolioId) {
        onSelect(id);
      }
    }
    setFavoriteIds(nextFavorites);
    localStorage.setItem("minty_favorite_portfolio_ids", JSON.stringify(nextFavorites));
  };

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolioName.trim()) return;

    setIsCreating(true);
    try {
      const created = await api.collection.createPortfolio(newPortfolioName.trim());
      toast.success(`Portfólio "${created.name}" criado!`);
      setNewPortfolioName("");
      setIsAddingMode(false);
      onRefresh();
      onSelect(created.id);
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar portfólio");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRenamePortfolio = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setIsUpdating(true);
    try {
      await api.collection.updatePortfolio(id, editName.trim());
      toast.success("Portfólio renomeado!");
      setEditingId(null);
      setEditName("");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao renomear portfólio");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePortfolio = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await api.collection.deletePortfolio(id);
      toast.success("Portfólio deletado com sucesso!");
      setDeletingId(null);
      onRefresh();
      // If we deleted the active one, select another
      if (activePortfolioId === id) {
        const remaining = portfolios.filter((p) => p.id !== id);
        if (remaining.length > 0) {
          onSelect(remaining[0].id);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao deletar portfólio");
    } finally {
      setIsDeleting(false);
    }
  };

  const startRename = (e: React.MouseEvent, p: Portfolio) => {
    e.stopPropagation();
    setEditingId(p.id);
    setEditName(p.name);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSearch("");
      setNewPortfolioName("");
      setEditingId(null);
      setEditName("");
      setDeletingId(null);
      setIsAddingMode(false);
    }
  };

  const startDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          icon={<ChevronDown className="size-4 animate-in fade-in" />}
        >
          {labelPrefix}
          <span className="text-primary font-extrabold hover:underline flex items-center gap-1.5 ml-1 select-none">
            {activePortfolio?.name ?? "Carregando..."}

          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 overflow-hidden bg-background border-border shadow-xl rounded-xl z-50">
        {/* Search header */}
        <div className="relative border-b border-border p-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar portfólio..."
            className="pl-8 h-8 bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-ring text-xs w-full"
          />
        </div>

        {/* Portfolios list */}
        <div className="max-h-[220px] overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
          {filteredPortfolios.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              Nenhum portfólio encontrado.
            </div>
          ) : (
            filteredPortfolios.map((p) => {
              const isActive = p.id === activePortfolioId;
              const isFavorite = favoriteIds.includes(p.id);
              const isEditing = p.id === editingId;
              const isConfirmingDelete = p.id === deletingId;

              if (isEditing) {
                return (
                  <form
                    key={p.id}
                    onSubmit={(e) => handleRenamePortfolio(e, p.id)}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/30 border border-border"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Input
                      ref={editInputRef}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-xs bg-background py-0 px-2"
                      disabled={isUpdating}
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        type="submit"
                        className="size-6 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 cursor-pointer"
                        disabled={isUpdating}
                      >
                        {isUpdating ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="size-6 text-muted-foreground hover:bg-muted cursor-pointer"
                        disabled={isUpdating}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  </form>
                );
              }

              if (isConfirmingDelete) {
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="font-semibold text-destructive truncate flex-1">Confirmar exclusão?</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={(e) => handleDeletePortfolio(e, p.id)}
                        className="h-6 px-2 text-[10px] font-bold bg-destructive text-destructive-foreground hover:bg-destructive/95 cursor-pointer"
                        disabled={isDeleting}
                      >
                        {isDeleting ? <Loader2 className="size-3 animate-spin" /> : "Excluir"}
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setDeletingId(null)}
                        className="h-6 px-2 text-[10px] font-bold text-muted-foreground hover:bg-muted cursor-pointer"
                        disabled={isDeleting}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelect(p.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border border-transparent",
                    isActive
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "hover:bg-muted/70 text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Folder className={cn("size-3.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-xs font-semibold truncate">
                      {p.name}
                    </span>
                    {p._count != null && (
                      <span className="text-[10px] text-muted-foreground/80 font-mono">
                        ({p._count.items})
                      </span>
                    )}
                  </div>

                  {/* Actions on Hover / Active */}
                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleToggleDefault(e, p.id)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-yellow-500 transition-colors"
                      title="Favoritar"
                    >
                      <Star className={cn("size-3.5", isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/60")} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => startRename(e, p)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Renomear"
                    >
                      <Edit2 className="size-3.5 text-muted-foreground/60 hover:text-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => startDelete(e, p.id)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                      title="Deletar"
                    >
                      <Trash2 className="size-3.5 text-muted-foreground/60 hover:text-destructive" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer selector creator */}
        <div className="border-t border-border bg-muted/20">
          {isAddingMode ? (
            <form onSubmit={handleCreatePortfolio} className="p-2 flex gap-1.5 items-center">
              <Input
                ref={addInputRef}
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                placeholder="Nome do portfólio..."
                className="h-8 text-xs bg-background"
                disabled={isCreating}
              />
              <Button
                size="sm"
                type="submit"
                className="h-8 text-xs shrink-0 cursor-pointer"
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="size-3 animate-spin" /> : "Criar"}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                type="button"
                onClick={() => setIsAddingMode(false)}
                className="size-8 shrink-0 text-muted-foreground cursor-pointer"
                disabled={isCreating}
              >
                <X className="size-4" />
              </Button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingMode(true)}
              className="w-full h-9 px-3 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer text-left"
            >
              <Plus className="size-3.5 text-primary" />
              <span>Adicionar Novo Portfólio</span>
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
