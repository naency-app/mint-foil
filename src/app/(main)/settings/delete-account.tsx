"use client";

import { Loader2, Trash2, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

/**
 * Exclusão definitiva da conta pelo próprio usuário.
 *
 * A confirmação é por digitação do @handle, e não é enfeite: o backend roda com
 * `session.freshAge: 0` (ver auth.ts) justamente porque exigir re-login para
 * excluir quebraria o fluxo social do app. Este passo é o que ocupa o lugar
 * daquela barreira — um clique só não pode apagar a coleção inteira.
 *
 * O servidor apaga o User e, por cascade, portfólios, itens, snapshots, scans,
 * follows, sessões e contas vinculadas.
 */
export function DeleteAccount({ handle }: { handle: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmacao, setConfirmacao] = useState("");
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const alvo = handle || "excluir";
  const confere = confirmacao.trim().replace(/^@+/, "") === alvo;

  async function excluir() {
    if (!confere) return;
    setExcluindo(true);
    setErro(null);
    try {
      const { error } = await authClient.deleteUser();
      if (error) throw new Error(error.message ?? "Não foi possível excluir.");
      router.replace("/login");
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : "Não foi possível excluir a conta.",
      );
      setExcluindo(false);
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
      <h2 className="flex items-center gap-2 font-bold text-destructive text-sm uppercase tracking-wider">
        <TriangleAlert className="size-4" />
        Excluir conta
      </h2>
      <Separator className="bg-destructive/20" />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="font-medium text-foreground text-sm">
            Apagar a conta e todos os dados
          </p>
          <p className="text-muted-foreground text-xs">
            Seus portfólios, cartas e histórico somem para sempre. Não dá para
            desfazer.
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="shrink-0 cursor-pointer"
          onClick={() => {
            setConfirmacao("");
            setErro(null);
            setOpen(true);
          }}
        >
          <Trash2 className="size-4" />
          Excluir conta
        </Button>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir sua conta?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>
                  Sua conta, seus portfólios, suas cartas e seu histórico serão
                  apagados para sempre. Essa ação não pode ser desfeita.
                </p>
                <p>
                  Se você tem uma assinatura ativa, cancele-a também na loja
                  onde assinou — excluir a conta aqui não cancela a cobrança.
                </p>
                <p>
                  Para confirmar, digite{" "}
                  <span className="font-bold text-foreground">@{alvo}</span>{" "}
                  abaixo.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Input
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            placeholder={`@${alvo}`}
            autoComplete="off"
          />
          {erro && <p className="text-destructive text-sm">{erro}</p>}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo} className="cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            {/* Botão comum, não AlertDialogAction: o Action fecha o diálogo ao
                clicar, e aqui a folha precisa continuar aberta enquanto exclui
                (e para mostrar o erro, se falhar). */}
            <Button
              variant="destructive"
              disabled={!confere || excluindo}
              onClick={excluir}
              className="cursor-pointer"
            >
              {excluindo && <Loader2 className="size-4 animate-spin" />}
              {excluindo ? "Excluindo…" : "Excluir tudo"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
