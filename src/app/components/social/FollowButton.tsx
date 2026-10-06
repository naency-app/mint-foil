"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api, type FollowStatus } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useEscreverStatusDeSeguir, useInvalidateSocial } from "@/lib/queries";
import { cn } from "@/lib/utils";

const LABEL: Record<Exclude<FollowStatus, "self">, string> = {
  none: "Seguir",
  requested: "Pedido enviado",
  following: "Seguindo",
};

/**
 * Seguir/deixar de seguir — espelho do FollowButton do app.
 *
 * none → "Seguir"; requested → "Pedido enviado" (clica para cancelar);
 * following → "Seguindo" (clica para deixar). Cancelar e deixar de seguir
 * pedem confirmação: desfeito, voltar exige outro pedido e outra aprovação.
 * Sem conta, o botão continua à vista e leva ao login.
 */
export function FollowButton({
  handle,
  status,
  tamanho = "sm",
}: {
  handle: string;
  status: FollowStatus;
  tamanho?: "sm" | "md";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const invalidate = useInvalidateSocial();
  const escreverStatus = useEscreverStatusDeSeguir();
  const [local, setLocal] = useState<FollowStatus>(status);
  const [busy, setBusy] = useState(false);
  const [confirmar, setConfirmar] = useState(false);

  // O estado local só existe para a resposta otimista do clique. Quando o
  // servidor manda outro (o perfil recarregou, o pedido foi aceito), ele vale.
  // biome-ignore lint/correctness/useExhaustiveDependencies: só reage ao status do servidor; `busy` é guarda, não gatilho
  useEffect(() => {
    if (!busy) setLocal(status);
  }, [status]);

  if (local === "self") return null;

  const ativo = local === "following" || local === "requested";
  const semConta =
    !session?.user ||
    (session.user as { isAnonymous?: boolean }).isAnonymous === true;

  function onClick() {
    if (busy) return;
    if (semConta) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (local === "none") void alternar();
    else setConfirmar(true);
  }

  async function alternar() {
    if (busy) return;
    setBusy(true);
    const antes = local;
    // Muda aqui e nas outras telas ao mesmo tempo (perfil ↔ busca ↔ listas)
    const marcar = (st: FollowStatus) => {
      setLocal(st);
      escreverStatus(handle, st);
    };
    try {
      if (local === "none") {
        marcar("requested");
        const r = await api.follows.follow(handle);
        marcar(r.status);
      } else {
        marcar("none");
        await api.follows.unfollow(handle);
      }
      void invalidate();
    } catch {
      marcar(antes);
    } finally {
      setBusy(false);
    }
  }

  const seguindo = local === "following";

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className={cn(
          "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 font-bold transition-colors disabled:cursor-default",
          tamanho === "md"
            ? "h-9 min-w-[120px] rounded-xl px-5 text-sm"
            : "h-8 min-w-[96px] rounded-lg px-3.5 text-xs",
          ativo
            ? "border border-border bg-muted text-foreground hover:bg-muted/70"
            : "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : LABEL[local]}
      </button>

      <AlertDialog open={confirmar} onOpenChange={setConfirmar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {seguindo ? `Deixar de seguir @${handle}?` : "Cancelar pedido?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {seguindo
                ? "Para seguir de novo, você vai precisar enviar outro pedido e esperar a aprovação."
                : `@${handle} ainda não aprovou o seu pedido.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-destructive text-white hover:bg-destructive/90"
              onClick={() => void alternar()}
            >
              {seguindo ? "Deixar de seguir" : "Cancelar pedido"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
