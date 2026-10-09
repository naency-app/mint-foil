"use client";

import { Check, Loader2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FotoDePerfil } from "@/app/(main)/settings/foto-de-perfil";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { authClient, useSession } from "@/lib/auth-client";
import { sanitizeHandle, useCampoHandle } from "@/lib/use-campo-handle";

/** Conta criada há menos disso é "nova": acabou de passar pelo login. */
const CONTA_NOVA_MS = 15 * 60 * 1000;
const CHAVE = "mf-perfil-completo.";

/** Só caminho interno: "/x" sim, "//x" ou "https://…" não (redirect aberto). */
function destinoSeguro(v: string | null): string {
  // Voltar para a própria tela seria um ciclo
  return v?.startsWith("/") &&
    !v.startsWith("//") &&
    !v.startsWith("/completar-perfil")
    ? v
    : "/explore";
}

export default function CompletarPerfilPage() {
  return (
    <Suspense>
      <CompletarPerfil />
    </Suspense>
  );
}

/**
 * "Complete seu perfil" na web — espelho da tela do app
 * (mint-foil-app/app/completar-perfil.tsx). O login do Google passa por aqui
 * antes de devolver a pessoa para onde ela ia: conta nova (o @ nasce
 * automático) ou sem nome vê foto, nome e @; quem não precisa segue direto.
 * Uma vez por conta neste navegador — "Pular" vale, e o resto se ajusta depois
 * em Configurações.
 */
function CompletarPerfil() {
  const router = useRouter();
  const volta = destinoSeguro(useSearchParams().get("volta"));
  const { data: session, isPending, refetch } = useSession();
  const u = session?.user as
    | {
        id: string;
        name?: string | null;
        nickname?: string | null;
        image?: string | null;
        handle?: string | null;
        handleEditCount?: number | null;
        isPro?: boolean | null;
        isAnonymous?: boolean | null;
        createdAt?: string | Date | null;
      }
    | undefined;

  const [decidido, setDecidido] = useState(false);
  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleAtual = u?.handle ?? "";
  const campo = useCampoHandle(
    handleAtual,
    !!u?.isPro || (u?.handleEditCount ?? 0) < 1,
  );

  // Decide uma vez, quando a sessão chega: mostra a tela ou segue direto
  useEffect(() => {
    if (isPending || decidido) return;
    if (!u || u.isAnonymous) {
      router.replace(`/login?redirect=${encodeURIComponent(volta)}`);
      return;
    }
    let jaFez = false;
    try {
      jaFez = localStorage.getItem(CHAVE + u.id) === "1";
    } catch {
      /* sem storage: segue só pela regra abaixo */
    }
    const criada = u.createdAt ? new Date(u.createdAt).getTime() : 0;
    const contaNova = criada > 0 && Date.now() - criada < CONTA_NOVA_MS;
    const semNome = !u.nickname?.trim() && !u.name?.trim();
    if (jaFez || (!contaNova && !semNome)) {
      router.replace(volta);
      return;
    }
    setNome(u.nickname ?? u.name ?? "");
    campo.setHandle(handleAtual);
    setDecidido(true);
  }, [isPending, u, decidido, volta, router, campo, handleAtual]);

  function marcarFeito() {
    try {
      if (u) localStorage.setItem(CHAVE + u.id, "1");
    } catch {
      /* a tela pode voltar no próximo login — melhor que travar */
    }
  }

  const nomeOk = nome.trim().length >= 2;
  const podeContinuar = !salvando && nomeOk && campo.valido;

  async function continuar() {
    if (!podeContinuar || !u) return;
    setSalvando(true);
    setErro(null);
    try {
      if (nome.trim() !== (u.nickname ?? "").trim()) {
        const { error } = await authClient.updateUser({
          nickname: nome.trim(),
        });
        if (error) throw new Error(error.message ?? "Falha ao salvar o nome");
      }
      if (campo.handleChanged) await api.users.updateHandle(campo.normalized);
      await refetch();
      marcarFeito();
      router.replace(volta);
    } catch (e) {
      setErro(
        (e as Error).message || "Não foi possível salvar. Tente de novo.",
      );
      setSalvando(false);
    }
  }

  function pular() {
    marcarFeito();
    router.replace(volta);
  }

  if (!decidido || !u) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="glass-card relative w-full max-w-sm !rounded-3xl p-8 shadow-xl">
        <h1 className="text-center text-xl font-black text-foreground">
          Complete seu perfil
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          É assim que seus amigos vão te encontrar e te ver no Mint Foil.
        </p>

        {/* Foto: prévia + Salvar, a mesma de Configurações */}
        <div className="mt-6 flex justify-center">
          <FotoDePerfil image={u.image ?? null} nome={nome || "?"} />
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Toque na foto para trocar
        </p>

        <label
          htmlFor="cp-nome"
          className="mt-6 block text-sm font-bold text-foreground"
        >
          Nome de exibição
        </label>
        <Input
          id="cp-nome"
          value={nome}
          onChange={(e) => setNome(e.target.value.slice(0, 24))}
          placeholder="Seu nome ou apelido"
          className="mt-2"
        />

        <label
          htmlFor="cp-handle"
          className="mt-5 block text-sm font-bold text-foreground"
        >
          Nome de usuário
        </label>
        <div className="relative mt-2">
          <span className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground text-sm">
            @
          </span>
          <Input
            id="cp-handle"
            value={campo.handle}
            onChange={(e) => campo.setHandle(sanitizeHandle(e.target.value))}
            placeholder="seuhandle"
            className="pr-9 pl-7"
          />
          <span className="-translate-y-1/2 absolute top-1/2 right-3">
            {campo.status === "checking" && (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            )}
            {campo.status === "ok" && (
              <Check className="size-4 text-emerald-500" />
            )}
            {(campo.status === "taken" || campo.status === "short") && (
              <X className="size-4 text-destructive" />
            )}
          </span>
        </div>
        <p className="mt-1.5 min-h-4 text-xs text-muted-foreground">
          {campo.status === "taken"
            ? (campo.reason ?? "Nome de usuário indisponível.")
            : campo.status === "short"
              ? "Precisa de pelo menos 3 caracteres."
              : "Dá para trocar uma vez de graça."}
        </p>

        {erro && <p className="mt-3 text-sm text-destructive">{erro}</p>}

        <button
          type="button"
          onClick={() => void continuar()}
          disabled={!podeContinuar}
          className="mt-6 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-default disabled:opacity-45"
        >
          {salvando ? <Loader2 className="size-4 animate-spin" /> : "Continuar"}
        </button>
        <button
          type="button"
          onClick={pular}
          className="mt-3 w-full cursor-pointer text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          Pular por enquanto
        </button>
      </div>
    </div>
  );
}
