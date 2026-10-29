"use client";

import {
  IconCheck,
  IconFolder,
  IconLoader2,
  IconPencil,
  IconSearch,
  IconSelector,
  IconStar,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GlassPill } from "@/components/ui/glass";
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
import { api, type Portfolio } from "@/lib/api";
import { usePortfolioStore } from "@/lib/portfolio-store";
import { cn } from "@/lib/utils";

interface PortfolioSelectorProps {
  portfolios: Portfolio[];
  activePortfolioId: string;
  onSelect: (id: string) => void;
  onRefresh?: () => void;
  labelPrefix?: string;
  hidePrefixOnMobile?: boolean;
  /**
   * Modo somente-leitura (ex.: perfil público de outro usuário): esconde as
   * ações de favoritar/renomear/deletar, que
   * mexeriam na conta do usuário LOGADO — não do dono do perfil.
   */
  readOnly?: boolean;
}

export function PortfolioSelector({
  portfolios,
  activePortfolioId,
  onSelect,
  onRefresh,
  labelPrefix = "Portfólio",
  hidePrefixOnMobile = false,
  readOnly = false,
}: PortfolioSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingPortfolio, setDeletingPortfolio] = useState<Portfolio | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const editInputRef = useRef<HTMLInputElement>(null);

  // Favoritos vivem no store (persistido), compartilhados com as outras telas
  const favoriteIds = usePortfolioStore((s) => s.favoriteIds);
  const toggleFavorite = usePortfolioStore((s) => s.toggleFavorite);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const activePortfolio =
    portfolios.find((p) => p.id === activePortfolioId) ?? portfolios[0];

  const filteredPortfolios = React.useMemo(() => {
    const list = portfolios.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()),
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
    const eraFavorito = favoriteIds.includes(id);
    toggleFavorite(id);
    if (eraFavorito) {
      toast.success("Removido dos favoritos");
    } else {
      toast.success("Adicionado aos favoritos!");
      if (id !== activePortfolioId) onSelect(id);
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
      onRefresh?.();
    } catch (err: any) {
      toast.error(err.message || "Erro ao renomear portfólio");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePortfolio = async () => {
    if (!deletingPortfolio) return;
    const id = deletingPortfolio.id;
    setIsDeleting(true);
    try {
      await api.collection.deletePortfolio(id);
      toast.success("Portfólio excluído com sucesso!");
      setDeletingPortfolio(null);
      onRefresh?.();
      // If we deleted the active one, select another
      if (activePortfolioId === id) {
        const remaining = portfolios.filter((p) => p.id !== id);
        if (remaining.length > 0) {
          onSelect(remaining[0].id);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir portfólio");
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
      setEditingId(null);
      setEditName("");
    }
  };

  const startDelete = (e: React.MouseEvent, p: Portfolio) => {
    e.stopPropagation();
    setDeletingPortfolio(p);
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          {/* Estilo único em todas as telas: texto solto, nome em destaque e a
            contagem do portfólio. Antes existia também uma variante em pill, e
            as duas apareciam lado a lado em telas diferentes. */}
          <button
            type="button"
            className="flex min-w-0 cursor-pointer items-center gap-1.5"
          >
            {labelPrefix && (
              <span
                className={cn(
                  "shrink-0 text-sm font-medium text-muted-foreground",
                  hidePrefixOnMobile && "hidden sm:inline",
                )}
              >
                {labelPrefix}
              </span>
            )}
            <span className="truncate text-sm font-bold text-primary">
              {activePortfolio?.name ?? "Selecionar portfólio"}
            </span>
            {activePortfolio?._count != null && (
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                ({activePortfolio._count.items})
              </span>
            )}
            <IconSelector className="size-4 shrink-0 text-primary" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-72 p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/70 shadow-2xl rounded-2xl z-50"
        >
          {/* Search header — sem caixa dupla nem anel de foco estourando ao abrir */}
          <div className="flex items-center gap-2.5 border-b border-border/60 px-3.5 py-2.5">
            <IconSearch className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar portfólio..."
              className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <IconX className="size-3.5" />
              </button>
            )}
          </div>

          {/* Portfolios list */}
          <div className="max-h-[240px] overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {filteredPortfolios.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                Nenhum portfólio encontrado.
              </div>
            ) : (
              filteredPortfolios.map((p) => {
                const isActive = p.id === activePortfolioId;
                const isFavorite = favoriteIds.includes(p.id);
                const isEditing = p.id === editingId;

                if (isEditing) {
                  return (
                    <form
                      key={p.id}
                      onSubmit={(e) => handleRenamePortfolio(e, p.id)}
                      className="flex items-center gap-2 p-1.5 rounded-xl bg-muted/30 border border-border"
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
                          {isUpdating ? (
                            <IconLoader2 className="size-3.5 animate-spin" />
                          ) : (
                            <IconCheck className="size-3.5" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="size-6 text-muted-foreground hover:bg-muted cursor-pointer"
                          disabled={isUpdating}
                        >
                          <IconX className="size-3.5" />
                        </Button>
                      </div>
                    </form>
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
                      "group flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-colors",
                      isActive
                        ? "bg-primary/12 text-primary"
                        : "hover:bg-muted/60 text-foreground",
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <IconFolder
                        className={cn(
                          "size-4 shrink-0",
                          isActive ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <span className="text-xs font-semibold truncate">
                        {p.name}
                      </span>
                      {p._count != null && (
                        <span
                          className={cn(
                            "text-[11px] font-mono tabular-nums",
                            isActive
                              ? "text-primary/80"
                              : "text-muted-foreground/70",
                          )}
                        >
                          {p._count.items}
                        </span>
                      )}
                    </div>

                    {/* Actions on Hover / Active */}
                    {!readOnly && (
                      <div
                        className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleToggleDefault(e, p.id)}
                          className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-yellow-500 transition-colors cursor-pointer"
                          title="Favoritar"
                        >
                          <IconStar
                            className={cn(
                              "size-3.5",
                              isFavorite
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/60",
                            )}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => startRename(e, p)}
                          className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Renomear"
                        >
                          <IconPencil className="size-3.5 text-muted-foreground/60 hover:text-foreground" />
                        </button>
                        {portfolios.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => startDelete(e, p)}
                            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                            title="Deletar"
                          >
                            <IconTrash className="size-3.5 text-muted-foreground/60 hover:text-destructive" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Dialog
        open={deletingPortfolio !== null}
        onOpenChange={(o) => !o && setDeletingPortfolio(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir portfólio?</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir{" "}
              <strong>{deletingPortfolio?.name}</strong>? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <GlassPill
              onClick={() => setDeletingPortfolio(null)}
              disabled={isDeleting}
              className="h-9 justify-center px-4 text-sm font-bold"
            >
              Cancelar
            </GlassPill>
            <Button
              variant="destructive"
              onClick={handleDeletePortfolio}
              disabled={isDeleting}
              className="h-9 rounded-full px-5 text-sm font-bold"
            >
              {isDeleting ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconTrash className="size-4" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
