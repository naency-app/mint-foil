"use client";

import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { Download, Share, X } from "lucide-react";
import { useState } from "react";

export function InstallBanner() {
  const { canInstall, isIos, isInstalled, isStandalone, install } =
    usePwaInstall();
  const [dismissed, setDismissed] = useState(false);

  if (isStandalone || isInstalled || dismissed) return null;
  if (!canInstall && !isIos) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden">
      <div className="relative rounded-2xl border border-emerald-500/30 bg-background/95 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 p-4">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 size-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="size-3.5" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="size-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <Download className="size-5 text-emerald-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground">
              Instalar Card Vault
            </h3>

            {isIos ? (
              <div className="mt-1 space-y-1.5">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Toque em{" "}
                  <Share className="inline size-3.5 -mt-0.5 text-blue-400" />{" "}
                  <span className="text-foreground font-medium">
                    Compartilhar
                  </span>{" "}
                  e depois{" "}
                  <span className="text-foreground font-medium">
                    &quot;Adicionar à Tela de Início&quot;
                  </span>
                </p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Scan de cartas, preços offline e acesso rápido
                </div>
              </div>
            ) : (
              <div className="mt-1 space-y-2">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Acesse o scan de cartas, preços offline e atalho na home.
                </p>
                <Button
                  size="sm"
                  onClick={install}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold h-8 text-xs gap-1.5"
                >
                  <Download className="size-3.5" />
                  Instalar agora
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
