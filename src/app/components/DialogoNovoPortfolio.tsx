"use client";

import { IconFolderPlus, IconLoader2 } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { BotaoFoil } from "@/components/ui/botao-foil";
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
import { api, type Portfolio } from "@/lib/api";

/**
 * Criar portfólio: o mesmo diálogo no Portfólio e no card "Adicionar ao
 * portfólio" da tela da carta. O limite do plano grátis (5) é do servidor;
 * a mensagem dele aparece no aviso de erro.
 */
export function DialogoNovoPortfolio({
  open,
  onOpenChange,
  onCriado,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Depois de criar: revalidar as listas e deixar o novo como ativo */
  onCriado: (portfolio: Portfolio) => void | Promise<void>;
}) {
  const [nome, setNome] = useState("");
  const [criando, setCriando] = useState(false);

  async function criar() {
    if (!nome.trim()) return;
    setCriando(true);
    try {
      const p = await api.collection.createPortfolio(nome.trim());
      await onCriado(p);
      onOpenChange(false);
      setNome("");
      toast.success(`Portfólio "${p.name}" criado!`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao criar portfólio",
      );
    } finally {
      setCriando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Portfólio</DialogTitle>
          <DialogDescription>
            Dê um nome para seu portfólio. Contas gratuitas podem ter até 5
            portfólios.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Minha coleção Pokémon"
          onKeyDown={(e) => {
            if (e.key === "Enter") criar();
          }}
        />
        {/* Padrão do sistema: BotaoFoil na ação, GlassPill no cancelar
            (o verde destoava, 21/10) */}
        <DialogFooter className="gap-2">
          <GlassPill
            onClick={() => onOpenChange(false)}
            className="h-9 justify-center px-4 text-sm"
          >
            Cancelar
          </GlassPill>
          <BotaoFoil
            onClick={criar}
            disabled={criando || !nome.trim()}
            className="justify-center"
          >
            {criando ? (
              <IconLoader2 className="animate-spin" />
            ) : (
              <IconFolderPlus />
            )}
            Criar portfólio
          </BotaoFoil>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * O botão redondo de criar portfólio, ao lado do seletor: o mesmo no
 * Portfólio e no card "Adicionar ao portfólio" da carta (30/10).
 */
export function BotaoNovoPortfolio({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Novo portfólio"
      aria-label="Novo portfólio"
      className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <IconFolderPlus className="size-4" />
    </button>
  );
}
