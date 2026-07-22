"use client";

import { IconArrowLeft, IconInfoCircle } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

// Mesma cara do wordmark da landing/navbar
const WORDMARK_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const frontendURL =
    typeof window !== "undefined" ? window.location.origin : "";

  async function handleGoogleSignIn() {
    setError("");
    setLoadingGoogle(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: `${frontendURL}/explore`,
      });
    } catch {
      setError("Erro ao conectar com o Google. Tente novamente.");
      setLoadingGoogle(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Brilho sutil atrás do card de vidro */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="glass-card relative w-full max-w-sm !rounded-3xl p-8 shadow-xl">
        {/* Wordmark */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {/* biome-ignore lint/performance/noImgElement: logo local pequeno */}
          <img
            src="/landing/logo-m.png"
            alt=""
            width={28}
            height={28}
            className="size-7"
          />
          <span
            className="select-none text-lg font-extrabold uppercase tracking-[0.15em] text-foreground"
            style={{ fontFamily: WORDMARK_FONT }}
          >
            Mint <span className="foil-text">Foil</span>
          </span>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Google sign-in */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          isLoading={loadingGoogle}
          icon={<GoogleIcon />}
          className="h-11 w-full rounded-full border-border bg-card text-foreground hover:bg-muted/40"
        >
          Continuar com Google
        </Button>

        {/* Termos */}
        <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-border bg-muted/30 px-3.5 py-3">
          <IconInfoCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Ao continuar, você concorda com os{" "}
            <Link
              href="/terms"
              className="font-medium text-foreground underline decoration-border underline-offset-2 transition-colors hover:text-primary"
            >
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link
              href="/privacy"
              className="font-medium text-foreground underline decoration-border underline-offset-2 transition-colors hover:text-primary"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/explore")}
          className="mt-5 flex w-full cursor-pointer items-center justify-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-tertiary-hover"
        >
          <IconArrowLeft className="size-4" /> Voltar
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <title>Google</title>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
