"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFollowList } from "@/lib/queries";
import { FollowButton } from "./FollowButton";
import { UserRow } from "./UserRow";

type Lista = "followers" | "following";

/**
 * "12 seguidores · 8 seguindo" embaixo do @ — clicar abre a lista, com o botão
 * de seguir em cada pessoa (como no app).
 */
export function SocialStats({
  handle,
  followers,
  following,
}: {
  handle: string;
  followers: number;
  following: number;
}) {
  const [aberta, setAberta] = useState<Lista | null>(null);

  const item = (tipo: Lista, n: number, rotulo: string) => (
    <button
      type="button"
      onClick={() => setAberta(tipo)}
      className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="font-bold text-foreground">{n}</span> {rotulo}
    </button>
  );

  return (
    <>
      <div className="mt-2 flex items-center justify-center gap-2">
        {item(
          "followers",
          followers,
          followers === 1 ? "seguidor" : "seguidores",
        )}
        <span className="text-muted-foreground/50">·</span>
        {item("following", following, "seguindo")}
      </div>

      <Dialog
        open={aberta !== null}
        onOpenChange={(o) => !o && setAberta(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {aberta === "followers" ? "Seguidores" : "Seguindo"}
            </DialogTitle>
          </DialogHeader>
          {aberta && (
            <ListaDePessoas
              handle={handle}
              tipo={aberta}
              onNavigate={() => setAberta(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ListaDePessoas({
  handle,
  tipo,
  onNavigate,
}: {
  handle: string;
  tipo: Lista;
  onNavigate: () => void;
}) {
  const { data, isPending, isError, refetch } = useFollowList(
    handle,
    tipo,
    true,
  );

  if (isPending) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  // Falha não pode virar "ninguém aqui": diz que falhou e dá a saída
  if (isError) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        Não foi possível carregar a lista.{" "}
        <button
          type="button"
          onClick={() => void refetch()}
          className="cursor-pointer font-semibold text-primary"
        >
          Tentar de novo
        </button>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        {tipo === "followers"
          ? "Ninguém segue este perfil ainda."
          : "Este perfil ainda não segue ninguém."}
      </p>
    );
  }
  return (
    <div className="max-h-[60vh] divide-y divide-border overflow-y-auto">
      {data.map((u) => (
        <UserRow key={u.handle} {...u} onNavigate={onNavigate}>
          {u.followStatus && (
            <FollowButton handle={u.handle} status={u.followStatus} />
          )}
        </UserRow>
      ))}
    </div>
  );
}
