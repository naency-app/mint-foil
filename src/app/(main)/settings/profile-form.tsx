"use client";

import { Check, Loader2, Lock, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { SOCIAL_LINKS, toDisplay, toUrl } from "@/lib/social-links";

const NAME_MAX = 24;
const HANDLE_MAX = 20;
const HANDLE_MIN = 3;
const BIO_MAX = 300;

// Espelha as regras do backend (auth/handle.ts): minúsculas, [a-z0-9_].
function sanitizeHandle(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, HANDLE_MAX);
}

type HandleStatus =
  | "current"
  | "short"
  | "locked"
  | "checking"
  | "ok"
  | "taken"
  | "error";

/**
 * Nome, @handle, descrição e links — o mesmo conjunto que a tela de editar
 * perfil do app grava.
 *
 * São dois destinos: nome e @handle vivem na sessão (better-auth), descrição e
 * links vão pelo endpoint próprio. Daí os dois salvamentos no mesmo submit.
 *
 * `bio`/`socials` não estão na sessão: a fonte é o showcase do próprio perfil,
 * que já é público e evita um endpoint só para ler o que a gente acabou de
 * escrever.
 */
export function ProfileForm({
  currentName,
  currentHandle,
  handleEditCount,
  isPro,
  onSaved,
}: {
  currentName: string;
  currentHandle: string;
  handleEditCount: number;
  isPro: boolean;
  /** Devolve o que foi salvo, para o cabeçalho da página acompanhar. */
  onSaved?: (perfil: { nickname: string; handle: string }) => void;
}) {
  const [name, setName] = useState(currentName);
  const [handle, setHandle] = useState(currentHandle);
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<{
    bio: string;
    socials: Record<string, string>;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const [debounced, setDebounced] = useState(sanitizeHandle(currentHandle));
  const [check, setCheck] = useState<{
    loading: boolean;
    available?: boolean;
    reason?: string;
  }>({ loading: false });

  const canEditHandle = isPro || handleEditCount < 1;
  const normalized = sanitizeHandle(handle);
  const handleChanged = normalized !== currentHandle;
  const tooShort = normalized.length < HANDLE_MIN;

  // Carrega descrição e links uma vez. Depois disso o que vale é o que a
  // pessoa digitou — um refetch não pode apagar edição em curso.
  useEffect(() => {
    if (!currentHandle) return;
    let vivo = true;
    api.users
      .showcase(currentHandle)
      .then((s) => {
        if (!vivo) return;
        const iniciais: Record<string, string> = {};
        for (const link of SOCIAL_LINKS) {
          const url = s.socials?.[link.key];
          if (url) iniciais[link.key] = toDisplay(link, url);
        }
        setBio(s.bio ?? "");
        setLinks(iniciais);
        setOriginal({ bio: s.bio ?? "", socials: s.socials ?? {} });
      })
      .catch(() => setOriginal({ bio: "", socials: {} }));
    return () => {
      vivo = false;
    };
  }, [currentHandle]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(normalized), 400);
    return () => clearTimeout(t);
  }, [normalized]);

  useEffect(() => {
    if (!handleChanged || !canEditHandle || tooShort) return;
    if (debounced !== normalized) return;
    let vivo = true;
    setCheck({ loading: true });
    api.users
      .checkHandle(debounced)
      .then(
        (r) =>
          vivo &&
          setCheck({
            loading: false,
            available: r.available,
            reason: r.reason,
          }),
      )
      .catch(() => vivo && setCheck({ loading: false, available: undefined }));
    return () => {
      vivo = false;
    };
  }, [debounced, normalized, handleChanged, canEditHandle, tooShort]);

  const status: HandleStatus = !handleChanged
    ? "current"
    : tooShort
      ? "short"
      : !canEditHandle
        ? "locked"
        : check.loading || debounced !== normalized
          ? "checking"
          : check.available === true
            ? "ok"
            : check.available === false
              ? "taken"
              : "error";

  const nameChanged = name.trim() !== currentName.trim();
  const bioChanged = !!original && bio.trim() !== original.bio;
  const linksChanged = useMemo(() => {
    if (!original) return false;
    return SOCIAL_LINKS.some((link) => {
      const atual = toUrl(link, links[link.key] ?? "");
      return (atual ?? null) !== (original.socials[link.key] ?? null);
    });
  }, [links, original]);

  const handleValid = !handleChanged || (canEditHandle && status === "ok");
  const canSave =
    !saving &&
    (nameChanged ||
      (handleChanged && canEditHandle) ||
      bioChanged ||
      linksChanged) &&
    name.trim().length >= 2 &&
    handleValid;

  async function salvar() {
    if (!canSave) return;

    // Link sem prefixo (YouTube, site, marketplaces) exige URL completa. Aponta
    // o campo antes de enviar, em vez de o backend recusar o lote inteiro.
    const socials: Record<string, string> = {};
    for (const link of SOCIAL_LINKS) {
      const url = toUrl(link, links[link.key] ?? "");
      if (url === undefined) {
        setErro(
          `Link do ${link.label}: cole o endereço completo, com https://`,
        );
        return;
      }
      if (url) socials[link.key] = url;
    }

    setSaving(true);
    setErro(null);
    setSalvo(false);
    try {
      if (nameChanged) {
        const { error } = await authClient.updateUser({
          nickname: name.trim(),
        });
        if (error) throw new Error(error.message ?? "Falha ao salvar o nome");
      }
      if (handleChanged && canEditHandle) {
        await api.users.updateHandle(normalized);
      }
      if (bioChanged || linksChanged) {
        const r = await api.users.updateProfile({ bio: bio.trim(), socials });
        setOriginal({ bio: r.bio ?? "", socials: r.socials ?? {} });
      }
      setSalvo(true);
      onSaved?.({
        nickname: name.trim(),
        handle: handleChanged && canEditHandle ? normalized : currentHandle,
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="glass-card !rounded-2xl p-6 space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
        <User className="size-4 text-primary" />
        Perfil público
      </h2>
      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <label htmlFor="perfil-nome" className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">
            Nome de exibição
          </span>
          <Input
            id="perfil-nome"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
            placeholder="Seu nome ou apelido"
          />
        </label>

        <label htmlFor="perfil-handle" className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">
            Nome de usuário
          </span>
          <div className="relative">
            <span className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground text-sm">
              @
            </span>
            <Input
              id="perfil-handle"
              value={handle}
              onChange={(e) => setHandle(sanitizeHandle(e.target.value))}
              disabled={!canEditHandle}
              placeholder="seuhandle"
              className="pr-9 pl-7"
            />
            <span className="-translate-y-1/2 absolute top-1/2 right-3">
              {status === "checking" && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              )}
              {status === "ok" && <Check className="size-4 text-emerald-500" />}
              {(status === "taken" || status === "short") && (
                <X className="size-4 text-destructive" />
              )}
              {status === "locked" && (
                <Lock className="size-4 text-muted-foreground" />
              )}
            </span>
          </div>
          <span className="block text-xs">
            {status === "locked" ? (
              <span className="text-muted-foreground">
                Você já usou a troca gratuita. Assine o Pro para trocar de novo.
              </span>
            ) : status === "taken" ? (
              <span className="text-destructive">
                {check.reason ?? "Nome de usuário indisponível."}
              </span>
            ) : status === "short" ? (
              <span className="text-destructive">
                Precisa de pelo menos {HANDLE_MIN} caracteres.
              </span>
            ) : status === "ok" ? (
              <span className="text-emerald-500">Disponível</span>
            ) : handleEditCount < 1 && !isPro ? (
              <span className="text-muted-foreground">
                A 1ª troca é grátis. Depois, só no Pro.
              </span>
            ) : null}
          </span>
        </label>
      </div>

      <label htmlFor="perfil-bio" className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">Descrição</span>
        <textarea
          id="perfil-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
          placeholder="Fale um pouco sobre a sua coleção."
          rows={3}
          className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <span className="block text-right text-muted-foreground text-xs">
          {bio.length}/{BIO_MAX}
        </span>
      </label>

      <div className="space-y-2">
        <p className="font-medium text-foreground text-sm">Links</p>
        <p className="text-muted-foreground text-xs">
          Aparecem no seu perfil público. Deixe em branco para não mostrar.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {SOCIAL_LINKS.map((link) => (
            <label
              key={link.key}
              htmlFor={`perfil-link-${link.key}`}
              className="flex items-center gap-3"
            >
              <span className="w-20 shrink-0 text-muted-foreground text-xs">
                {link.label}
              </span>
              <Input
                id={`perfil-link-${link.key}`}
                value={links[link.key] ?? ""}
                onChange={(e) =>
                  setLinks((p) => ({ ...p, [link.key]: e.target.value }))
                }
                placeholder={link.placeholder}
                className="h-9"
              />
            </label>
          ))}
        </div>
      </div>

      {erro && <p className="text-destructive text-sm">{erro}</p>}

      <div className="flex items-center justify-end gap-3">
        {salvo && !saving && (
          <span className="text-emerald-500 text-xs">Salvo</span>
        )}
        <Button
          onClick={salvar}
          disabled={!canSave}
          size="sm"
          className="cursor-pointer"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          Salvar
        </Button>
      </div>
    </section>
  );
}
