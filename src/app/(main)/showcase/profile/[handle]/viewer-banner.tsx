"use client";

import { Check, Eye, Share2 } from "lucide-react";
import { useState } from "react";
import { PerfilAcoes } from "@/app/components/social/PerfilAcoes";
import { useSession } from "@/lib/auth-client";

/**
 * Para o DONO do perfil: um chip discreto indicando que é a visão pública +
 * botão de compartilhar. Para outra pessoa logada: o menu de denunciar e
 * bloquear. Fica no canto do banner (o page posiciona).
 */
export function ViewerBanner({
  handle,
  displayName,
  shareUrl,
}: {
  handle: string;
  displayName: string;
  shareUrl: string;
}) {
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);

  const viewerHandle = (session?.user as { handle?: string } | undefined)
    ?.handle;
  const isOwner =
    !!viewerHandle && viewerHandle.toLowerCase() === handle.toLowerCase();

  if (!isOwner) {
    const logado =
      !!session?.user &&
      (session.user as { isAnonymous?: boolean }).isAnonymous !== true;
    return logado ? (
      <PerfilAcoes handle={handle} displayName={displayName} />
    ) : null;
  }

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
    <div className="flex items-center gap-2">
      <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-background/70 px-3.5 text-[11px] font-semibold text-muted-foreground backdrop-blur">
        <Eye className="size-3.5" />
        Seu perfil público
      </span>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary px-3.5 text-[11px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
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
