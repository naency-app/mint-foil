"use client";

import {
  IconLoader2,
  IconLogin,
  IconLogout,
  IconPalette,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FotoDoUsuario } from "@/components/FotoDoUsuario";
import { signOut, useSession } from "@/lib/auth-client";
import { TEMAS } from "@/lib/temas";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

/**
 * Os três temas como itens de rádio, compartilhados pelo submenu Aparência
 * (logado) e pelo botão de tema (sem login). `onSelect` com preventDefault
 * para o menu não fechar ao trocar: dá para ver o resultado na hora e voltar
 * atrás sem reabrir.
 */
function OpcoesTema() {
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
      {TEMAS.map((t) => (
        <DropdownMenuRadioItem
          key={t.value}
          value={t.value}
          onSelect={(e) => e.preventDefault()}
          className="cursor-pointer gap-2 rounded-lg py-2 text-sm font-medium focus:bg-muted/60"
        >
          <t.icon className="size-4 text-muted-foreground" />
          {t.label}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );
}

export function UserMenu() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isPending) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />;
  }

  if (!session) {
    // Sem conta o tema também muda: o botão mostra o ícone do tema atual. Só
    // no computador — no celular a Aparência já fica no menu lateral.
    const TemaAtual = TEMAS.find((t) => t.value === theme)?.icon ?? IconPalette;
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Aparência"
              className="text-muted-foreground hover:text-foreground max-md:hidden"
            >
              <TemaAtual className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="glass-card w-44 !rounded-2xl border-border p-1.5 shadow-xl"
          >
            <OpcoesTema />
          </DropdownMenuContent>
        </DropdownMenu>
        <Link href="/login">
          <Button size="sm">
            <IconLogin className="size-4" />
            Entrar
          </Button>
        </Link>
      </>
    );
  }

  const user = session.user;

  async function handleLogout() {
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
    <>
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted cursor-pointer outline-none"
        >
          {user.image ? (
            <FotoDoUsuario
              src={user.image}
              alt={user.name ?? "Avatar"}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-xs font-bold text-foreground">
              {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="glass-card w-60 !rounded-2xl border-border p-1.5 shadow-xl"
      >
        {/* Header do usuário com avatar */}
        <div className="flex items-center gap-3 px-2 py-2">
          {user.image ? (
            <FotoDoUsuario
              src={user.image}
              alt=""
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-bold text-foreground">
              {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            {user.name && (
              <p className="truncate text-sm font-semibold text-foreground">
                {user.name}
              </p>
            )}
            {user.email && (
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem
          className="cursor-pointer rounded-lg px-2 py-2 text-sm font-medium focus:bg-muted/60"
          onClick={() => router.push("/settings")}
        >
          <IconSettings className="size-4 text-muted-foreground" />
          Configurações
        </DropdownMenuItem>

        {/*
          Aparência mora aqui, junto de Configurações e Sair: é preferência de
          conta, não ação de navegação. Submenu porque são três temas — o Mint
          é o escuro com o fundo foil.
        */}
        <DropdownMenuSub>
          {/* md:hidden igual ao menu lateral: no celular o tema já fica lá,
              e repetir aqui era redundante (21/10) */}
          <DropdownMenuSubTrigger className="cursor-pointer gap-2 rounded-lg px-2 py-2 text-sm font-medium focus:bg-muted/60 data-[state=open]:bg-muted/60 max-md:hidden">
            <IconPalette className="size-4 text-muted-foreground" />
            Aparência
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent
            sideOffset={8}
            className="glass-card w-44 !rounded-2xl border-border p-1.5 shadow-xl"
          >
            <OpcoesTema />
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer rounded-lg px-2 py-2 text-sm font-medium"
          onSelect={() => setLogoutDialogOpen(true)}
        >
          <IconLogout className="size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Diálogo de confirmação para sair da conta */}
    <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Sair da sua conta?</AlertDialogTitle>
          <AlertDialogDescription>
            Você precisará entrar novamente com seu e-mail para acessar sua coleção, portfólios e configurações.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={saindo}>
            Cancelar
          </AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={saindo}
            onClick={handleLogout}
            className="h-9 rounded-full px-5 text-sm font-bold"
          >
            {saindo && <IconLoader2 className="size-4 animate-spin" />}
            Sair da conta
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
