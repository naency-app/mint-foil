"use client";

import { Ban, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRow } from "@/app/components/social/UserRow";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { useBlocks, useInvalidateSocial } from "@/lib/queries";

/**
 * Contas bloqueadas, com desbloquear — a mesma tela do app (Ajustes →
 * Bloqueados).
 *
 * Existe por exigência de loja: quem bloqueia tem que conseguir desfazer sem
 * depender de achar o perfil de novo — e, bloqueado, o perfil não aparece mais
 * na busca, então esta é a única porta de volta.
 */
export function ContasBloqueadas() {
  const { data, isLoading, isError, refetch, isFetching } = useBlocks(true);
  const invalidate = useInvalidateSocial();
  const [emAndamento, setEmAndamento] = useState<string | null>(null);

  async function desbloquear(handle: string, displayName: string) {
    setEmAndamento(handle);
    try {
      await api.moderation.unblock(handle);
      await invalidate();
      toast.success(`${displayName} foi desbloqueado`);
    } catch {
      toast.error(
        `${displayName} continua bloqueado. Tente de novo em instantes.`,
      );
    } finally {
      setEmAndamento(null);
    }
  }

  return (
    <section className="glass-card !rounded-2xl p-6 space-y-4">
      <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
        <Ban className="size-4 text-primary" />
        Contas bloqueadas
      </h2>
      <Separator />
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar as contas bloqueadas.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            Tentar de novo
          </Button>
        </div>
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">
          Você não bloqueou ninguém.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {data.map((u) => (
            <UserRow
              key={u.handle}
              handle={u.handle}
              displayName={u.displayName}
              image={u.image}
              isPro={u.isPro}
            >
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void desbloquear(u.handle, u.displayName)}
                disabled={emAndamento === u.handle}
              >
                {emAndamento === u.handle ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Desbloquear"
                )}
              </Button>
            </UserRow>
          ))}
        </div>
      )}
    </section>
  );
}
