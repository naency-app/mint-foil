"use client";

import { IconLoader2, IconTrash } from "@tabler/icons-react";
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
import { GlassPill } from "@/components/ui/glass";
import { Input } from "@/components/ui/input";
import { textoDoErro } from "@/lib/api";
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
      setErro(textoDoErro(e, "Não foi possível excluir a conta."));
      setExcluindo(false);
    }
  }

  return (
    <>
      {/* Uma linha do card "Conta" das Configurações. O botão é discreto
          (contorno vermelho, sem fundo): era o mais chamativo da tela, para a
          ação mais rara e sem volta (30/10). O peso fica no diálogo. */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-foreground text-sm">Excluir conta</p>
          <p className="text-muted-foreground text-xs">
            Apaga portfólios, cartas e histórico para sempre.
          </p>
        </div>
        <GlassPill
          className="h-8 shrink-0 gap-1.5 px-3 text-xs font-bold text-destructive hover:bg-destructive/10"
          onClick={() => {
            setConfirmacao("");
            setErro(null);
            setOpen(true);
          }}
        >
          <IconTrash className="size-3.5" />
          Excluir
        </GlassPill>
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
              {excluindo && <IconLoader2 className="size-4 animate-spin" />}
              {excluindo ? "Excluindo…" : "Excluir tudo"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
