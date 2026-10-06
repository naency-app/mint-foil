"use client";

import { Loader2, Search, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserSearch } from "@/lib/queries";
import { FollowButton } from "./FollowButton";
import { UserRow } from "./UserRow";

/** "Adicionar amigos": busca por @ ou nome, com o botão de seguir em cada um. */
export function AdicionarAmigos() {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [termo, setTermo] = useState("");

  // Debounce: só o termo estabilizado vira chave de query
  useEffect(() => {
    const id = setTimeout(() => setTermo(texto.trim()), 300);
    return () => clearTimeout(id);
  }, [texto]);

  const { data, isFetching, isError, refetch } = useUserSearch(termo);
  const curto = termo.length < 2;

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-background/70 px-3.5 text-[11px] font-bold text-foreground backdrop-blur transition-colors hover:bg-muted/60"
      >
        <UserPlus className="size-3.5" /> Adicionar amigos
      </button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar amigos</DialogTitle>
          </DialogHeader>
          <div className="glass-input flex h-11 items-center gap-2.5 px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Buscar por @ ou nome"
              className="h-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {isFetching && (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="max-h-[55vh] min-h-24 divide-y divide-border overflow-y-auto">
            {curto ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Digite pelo menos 2 letras.
              </p>
            ) : isError ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Não foi possível buscar.{" "}
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="cursor-pointer font-semibold text-primary"
                >
                  Tentar de novo
                </button>
              </p>
            ) : data && data.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Ninguém encontrado com “{termo}”.
              </p>
            ) : (
              data?.map((u) => (
                <UserRow
                  key={u.handle}
                  {...u}
                  onNavigate={() => setAberto(false)}
                >
                  <FollowButton
                    handle={u.handle}
                    status={u.followStatus ?? "none"}
                  />
                </UserRow>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
