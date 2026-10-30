"use client";

import { IconLoader2 } from "@tabler/icons-react";
import { useState } from "react";
import { signOut } from "@/lib/auth-client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

/**
 * Confirmação de sair da conta, a mesma no menu do avatar (computador) e no
 * menu lateral (celular). Quem abre só controla o `open`.
 */
export function DialogoSair({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    try {
      await signOut();
    } catch {
      // ignore network errors — session cookie will expire naturally
    }
    // Recarga completa para limpar a sessão guardada no React/Better-Auth. Vai
    // para o Explorar, que funciona sem conta: de dentro do sistema não se
    // volta para a landing (mesma regra do logo, 21/10).
    window.location.href = "/explore";
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Sair da sua conta?</AlertDialogTitle>
          <AlertDialogDescription>
            Sua coleção continua salva. Para ver de novo, é só entrar com o
            Google.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={saindo}>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={saindo}
            onClick={sair}
            className="h-9 rounded-full px-5 text-sm font-bold"
          >
            {saindo && <IconLoader2 className="size-4 animate-spin" />}
            Sair da conta
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
