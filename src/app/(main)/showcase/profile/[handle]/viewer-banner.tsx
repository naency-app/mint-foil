"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";

/**
 * Faixa que só aparece para o DONO do perfil, deixando claro que aquilo é a
 * visão pública (como os outros veem ao receber o link compartilhado) e dando
 * um atalho para compartilhar. Visitantes não veem nada — para eles o perfil
 * já é a visão de share, com o CTA de cadastro no rodapé da página.
 */
export function ViewerBanner({
  handle,
  shareUrl,
}: {
  handle: string;
  shareUrl: string;
}) {
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);

  const viewerHandle = (
    session?.user as { handle?: string } | undefined
  )?.handle;
  const isOwner =
    !!viewerHandle && viewerHandle.toLowerCase() === handle.toLowerCase();

  if (!isOwner) return null;

  async function handleShare() {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* usuário cancelou / clipboard bloqueado */
    }
  }

  return (
    <div className="glass-card !rounded-xl p-3.5 flex items-center justify-between gap-4">
      <p className="text-xs text-muted-foreground">
        <span className="text-foreground font-semibold">
          Este é o seu perfil público.
        </span>{" "}
        É assim que ele aparece quando você compartilha.
      </p>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold px-3.5 py-1.5 hover:bg-primary/90 transition-colors shrink-0 cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="size-3.5" /> Copiado!
          </>
        ) : (
          <>
            <Share2 className="size-3.5" /> Compartilhar
          </>
        )}
      </button>
    </div>
  );
}
