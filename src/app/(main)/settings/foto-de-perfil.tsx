"use client";

import { Camera, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useInvalidateSocial } from "@/lib/queries";

/** Lado maior da foto enviada: o servidor reprocessa, mas não precisa de 12 MP. */
const LADO_MAX = 1024;

/** Lê o arquivo, corta no quadrado central e reduz — devolve JPEG em base64. */
async function prepararFoto(
  arquivo: File,
): Promise<{ uri: string; base64: string }> {
  const bitmap = await createImageBitmap(arquivo);
  const lado = Math.min(bitmap.width, bitmap.height);
  const saida = Math.min(lado, LADO_MAX);
  const canvas = document.createElement("canvas");
  canvas.width = saida;
  canvas.height = saida;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");
  ctx.drawImage(
    bitmap,
    (bitmap.width - lado) / 2,
    (bitmap.height - lado) / 2,
    lado,
    lado,
    0,
    0,
    saida,
    saida,
  );
  const uri = canvas.toDataURL("image/jpeg", 0.85);
  return { uri, base64: uri.split(",")[1] ?? "" };
}

/**
 * Foto de perfil editável nas configurações — espelho do FotoDePerfil do app.
 *
 * Escolher uma imagem abre a prévia, e ela só vale no "Salvar" (como em Editar
 * perfil do app): fechar sem salvar não troca nada. Existe porque o login da
 * Apple nunca entrega foto, e porque nem todo mundo quer a foto do Google.
 */
export function FotoDePerfil({
  image,
  nome,
}: {
  image: string | null;
  nome: string;
}) {
  const { refetch } = useSession();
  const invalidateSocial = useInvalidateSocial();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previa, setPrevia] = useState<{ uri: string; base64: string } | null>(
    null,
  );
  const [salvando, setSalvando] = useState(false);

  async function aoEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = ""; // permite escolher o mesmo arquivo de novo
    if (!arquivo) return;
    try {
      setPrevia(await prepararFoto(arquivo));
    } catch {
      toast.error("Não foi possível abrir essa imagem. Tente outra.");
    }
  }

  async function depoisDeSalvar() {
    await refetch();
    await invalidateSocial();
  }

  async function salvar() {
    if (!previa) return;
    setSalvando(true);
    try {
      await api.users.setAvatar(previa.base64);
      await depoisDeSalvar();
      setPrevia(null);
      toast.success("Foto de perfil atualizada");
    } catch (err) {
      toast.error((err as Error).message || "Não foi possível trocar a foto.");
    } finally {
      setSalvando(false);
    }
  }

  async function remover() {
    setSalvando(true);
    try {
      await api.users.removeAvatar();
      await depoisDeSalvar();
      toast.success("Foto removida");
    } catch {
      toast.error("Não foi possível remover a foto.");
    } finally {
      setSalvando(false);
    }
  }

  const inicial = nome.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={salvando}
        aria-label="Alterar foto de perfil"
        className="group relative h-20 w-20 cursor-pointer overflow-hidden rounded-full border-4 border-card bg-muted shadow-md"
      >
        {image ? (
          <Image
            src={image}
            alt={nome}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-bold text-2xl text-foreground">
            {inicial}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
          {salvando ? (
            <Loader2 className="size-5 animate-spin text-white" />
          ) : (
            <Camera className="size-5 text-white" />
          )}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void aoEscolher(e)}
      />

      <Dialog
        open={!!previa}
        onOpenChange={(o) => !o && !salvando && setPrevia(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova foto de perfil</DialogTitle>
          </DialogHeader>
          {previa && (
            // biome-ignore lint/performance/noImgElement: prévia local (data URL), o otimizador não se aplica
            <img
              src={previa.uri}
              alt="Prévia da nova foto"
              className="mx-auto size-40 rounded-full object-cover"
            />
          )}
          <div className="flex justify-between gap-2 pt-2">
            {image ? (
              <button
                type="button"
                disabled={salvando}
                onClick={() => {
                  setPrevia(null);
                  void remover();
                }}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
              >
                <Trash2 className="size-4" /> Remover foto atual
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={salvando}
                onClick={() => setPrevia(null)}
                className="h-9 cursor-pointer rounded-md border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={salvando}
                onClick={() => void salvar()}
                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {salvando && <Loader2 className="size-4 animate-spin" />}
                Salvar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
