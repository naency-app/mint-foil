"use client";

import { Ban, Flag, Loader2, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, type ReportReason } from "@/lib/api";
import { useInvalidateSocial } from "@/lib/queries";

// Mesmos motivos e textos do app (profile-actions-sheet)
const MOTIVOS: { key: ReportReason; label: string }[] = [
  { key: "SPAM", label: "Spam ou propaganda" },
  { key: "OFFENSIVE", label: "Conteúdo ofensivo" },
  {
    key: "IMPERSONATION",
    label: "Perfil falso ou se passando por outra pessoa",
  },
  { key: "SCAM", label: "Golpe ou tentativa de fraude" },
  { key: "OTHER", label: "Outro motivo" },
];

/**
 * Ações sobre o perfil de outra pessoa: denunciar e bloquear. As lojas exigem
 * isso no app; na web vale o mesmo — o perfil é público dos dois lados.
 */
export function PerfilAcoes({
  handle,
  displayName,
}: {
  handle: string;
  displayName: string;
}) {
  const router = useRouter();
  const invalidate = useInvalidateSocial();
  const [denunciarAberto, setDenunciarAberto] = useState(false);
  const [bloquearAberto, setBloquearAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function denunciar(reason: ReportReason) {
    setEnviando(true);
    try {
      await api.moderation.report(handle, reason);
      setDenunciarAberto(false);
      toast.success("Denúncia enviada", {
        description:
          "Vamos analisar esse perfil. Se quiser, você também pode bloquear a pessoa agora.",
      });
    } catch {
      toast.error("Não foi possível denunciar. Tente de novo em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  async function bloquear() {
    setEnviando(true);
    try {
      await api.moderation.block(handle);
      await invalidate();
      setBloquearAberto(false);
      toast.success("Perfil bloqueado", {
        description: `${displayName} não aparece mais para você, e você não aparece para ele. Dá para desfazer no app, em Config → Contas bloqueadas.`,
      });
      // Perfil bloqueado responde como inexistente: continuar aqui não faz sentido
      router.push("/explore");
    } catch {
      toast.error("Não foi possível bloquear. Tente de novo em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Mais ações para @${handle}`}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur transition-colors hover:bg-muted/60"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => setDenunciarAberto(true)}
          >
            <Flag className="size-4" /> Denunciar perfil
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onSelect={() => setBloquearAberto(true)}
          >
            <Ban className="size-4" /> Bloquear
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={denunciarAberto} onOpenChange={setDenunciarAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Denunciar @{handle}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Qual o problema com este perfil?
          </p>
          <div className="flex flex-col gap-2">
            {MOTIVOS.map((m) => (
              <button
                key={m.key}
                type="button"
                disabled={enviando}
                onClick={() => void denunciar(m.key)}
                className="cursor-pointer rounded-xl border border-border px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {m.label}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={bloquearAberto} onOpenChange={setBloquearAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bloquear {displayName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Vocês deixam de se seguir e nenhum dos dois vê o perfil do outro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={enviando} className="cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            {/* Botão comum: o Action fecharia o diálogo antes do bloqueio terminar */}
            <button
              type="button"
              disabled={enviando}
              onClick={() => void bloquear()}
              className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md bg-destructive px-4 text-sm font-semibold text-white transition-colors hover:bg-destructive/90 disabled:opacity-50"
            >
              {enviando && <Loader2 className="size-4 animate-spin" />}
              Bloquear
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
