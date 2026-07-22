"use client";

import { IconLogin, IconLogout, IconSettings } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function UserMenu() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isPending) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />;
  }

  if (!session) {
    return (
      <Link href="/login">
        <Button size="sm">
          <IconLogin className="size-4" />
          Entrar
        </Button>
      </Link>
    );
  }

  const user = session.user;

  async function handleLogout() {
    try {
      await signOut();
    } catch {
      // ignore network errors — session cookie will expire naturally
    }
    // Full page reload to clear all cached session state from React/Better-Auth
    window.location.href = "/";
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted cursor-pointer outline-none"
        >
          {user.image ? (
            <Image
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
            <Image
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

        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer rounded-lg px-2 py-2 text-sm font-medium"
          onClick={handleLogout}
        >
          <IconLogout className="size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
