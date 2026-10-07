"use client";

import { UserPlus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, type FollowRequest } from "@/lib/api";
import { useFollowRequests, useInvalidateSocial } from "@/lib/queries";
import { UserRow } from "./UserRow";

/**
 * Pedidos para seguir (só no próprio perfil). Some quando não há pedido; com
 * pedido, mostra a contagem e abre a lista para aceitar ou recusar.
 */
export function PedidosButton() {
  const { data } = useFollowRequests(true);
  const [aberto, setAberto] = useState(false);
  const pedidos = data ?? [];

  if (pedidos.length === 0 && !aberto) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-background/70 px-3.5 text-[11px] font-bold text-foreground backdrop-blur transition-colors hover:bg-muted/60"
      >
        <UserPlus className="size-3.5" />
        Pedidos
        <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
          {pedidos.length}
        </span>
      </button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pedidos para seguir</DialogTitle>
          </DialogHeader>
          {pedidos.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum pedido pendente.
            </p>
          ) : (
            <div className="max-h-[60vh] divide-y divide-border overflow-y-auto">
              {pedidos.map((p) => (
                <LinhaDePedido
                  key={p.id}
                  pedido={p}
                  onNavigate={() => setAberto(false)}
                />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function LinhaDePedido({
  pedido,
  onNavigate,
}: {
  pedido: FollowRequest;
  onNavigate: () => void;
}) {
  const invalidate = useInvalidateSocial();
  const [busy, setBusy] = useState<"aceitar" | "recusar" | null>(null);

  async function responder(acao: "aceitar" | "recusar") {
    setBusy(acao);
    try {
      if (acao === "aceitar") await api.follows.accept(pedido.id);
      else await api.follows.reject(pedido.id);
      await invalidate();
    } finally {
      setBusy(null);
    }
  }

  return (
    <UserRow {...pedido.user} onNavigate={onNavigate}>
      <div className="flex shrink-0 gap-1.5">
        <button
          type="button"
          disabled={!!busy}
          onClick={() => void responder("recusar")}
          className="h-8 cursor-pointer rounded-lg border border-border px-3 text-xs font-bold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          Recusar
        </button>
        <button
          type="button"
          disabled={!!busy}
          onClick={() => void responder("aceitar")}
          className="h-8 cursor-pointer rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          Aceitar
        </button>
      </div>
    </UserRow>
  );
}
