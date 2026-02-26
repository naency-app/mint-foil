"use client";

import { signOut, useSession } from "@/lib/auth-client";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const options = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Escuro", icon: Moon },
    { value: "system", label: "Sistema", icon: Moon },
  ] as const;

  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <opt.icon className="size-4" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  async function handleLogout() {
    await signOut();
    router.replace("/login");
  }

  if (isPending) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      </main>
    );
  }

  if (!session) return null;

  const user = session.user;

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie sua conta e preferências.
        </p>
      </div>

      {/* Profile Section */}
      <section className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 space-y-4">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <User className="size-4" />
          Perfil
        </h2>

        <div className="flex items-center gap-4">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "Avatar"}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full border-2 border-border object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-border bg-muted text-xl font-bold text-foreground">
              {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
            </div>
          )}

          <div className="space-y-0.5">
            {user.name && (
              <p className="text-lg font-semibold text-foreground">
                {user.name}
              </p>
            )}
            {user.email && (
              <p className="text-sm text-muted-foreground">{user.email}</p>
            )}
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 space-y-4">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Sun className="size-4" />
          Aparência
        </h2>

        <div>
          <p className="text-sm text-muted-foreground mb-3">
            Selecione o tema da interface.
          </p>
          <ThemeSelector />
        </div>
      </section>

      {/* Danger Zone */}
      <section className="rounded-xl border border-destructive/30 bg-destructive/5 backdrop-blur-sm p-6 space-y-4">
        <h2 className="text-sm font-bold text-destructive uppercase tracking-wider flex items-center gap-2">
          <LogOut className="size-4" />
          Sessão
        </h2>

        <Separator className="bg-destructive/20" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Encerrar sessão
            </p>
            <p className="text-xs text-muted-foreground">
              Você será redirecionado para a tela de login.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="cursor-pointer"
          >
            <LogOut className="size-4" />
            Sair
          </Button>
        </div>
      </section>
    </main>
  );
}
