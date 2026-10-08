"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const HANDLE_MAX = 20;
export const HANDLE_MIN = 3;

// Espelha as regras do backend (auth/handle.ts): minúsculas, [a-z0-9_].
export function sanitizeHandle(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, HANDLE_MAX);
}

export type HandleStatus =
  | "current"
  | "short"
  | "locked"
  | "checking"
  | "ok"
  | "taken"
  | "error";

/**
 * Campo de @handle com checagem de disponibilidade (debounce de 400ms) — o
 * mesmo em Configurações e em "Complete seu perfil", para a regra não divergir.
 */
export function useCampoHandle(currentHandle: string, canEditHandle: boolean) {
  const [handle, setHandle] = useState(currentHandle);
  const [debounced, setDebounced] = useState(sanitizeHandle(currentHandle));
  const [check, setCheck] = useState<{
    loading: boolean;
    available?: boolean;
    reason?: string;
  }>({ loading: false });

  const normalized = sanitizeHandle(handle);
  const handleChanged = normalized !== currentHandle;
  const tooShort = normalized.length < HANDLE_MIN;

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

  return {
    handle,
    setHandle,
    normalized,
    handleChanged,
    status,
    reason: check.reason,
    /** Pode salvar o @: não mudou, ou mudou e está livre. */
    valido: !handleChanged || (canEditHandle && status === "ok"),
  };
}
