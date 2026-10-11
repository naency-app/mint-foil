"use client";

import { ScanLine, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { QRCode } from "@/components/ui/qrcode";
import { APP_STORE_URL, DOWNLOAD_URL, PLAY_STORE_URL } from "@/lib/app-links";
import { cn } from "@/lib/utils";

/**
 * Convites para baixar o app, espalhados pela web onde o app resolve melhor o
 * que a pessoa está fazendo (o scan só existe no app).
 *
 * No desktop o convite é um QR code: quem está no computador aponta o celular
 * e baixa sem sair do site. No celular, onde QR não serve, vira botão.
 *
 * O botão leva ao /download, não à loja: enquanto o app não estiver publicado
 * nas duas lojas, o link direto cairia em "app não encontrado".
 */

/** Selos oficiais das duas lojas (os mesmos do ProUpgradeModal). */
export function SelosLojas({
  className,
  tamanho = 150,
}: {
  className?: string;
  /** Largura de cada selo, em px */
  tamanho?: number;
}) {
  const altura = Math.round((tamanho * 44) / 150);
  return (
    <div className={cn("flex gap-3", className)}>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="opacity-90 transition-opacity hover:opacity-100"
      >
        <Image
          src="/logos/app-store-apple.svg"
          alt="Download on the App Store"
          width={tamanho}
          height={altura}
        />
      </a>
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="opacity-90 transition-opacity hover:opacity-100"
      >
        <Image
          src="/logos/app-google-play.svg"
          alt="Get it on Google Play"
          width={tamanho}
          height={altura}
        />
      </a>
    </div>
  );
}

/** QR code que abre a página de download no celular. */
export function QrDoApp({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "shrink-0 rounded-xl border border-border bg-background p-2",
        className,
      )}
    >
      <QRCode data={DOWNLOAD_URL} robustness="M" />
    </div>
  );
}

/**
 * Cartão para colunas estreitas (tela da carta): QR e selos no desktop, botão
 * no celular.
 */
export function ConviteAppCartao({
  titulo,
  texto,
}: {
  titulo: string;
  texto: string;
}) {
  return (
    <div className="glass-card !rounded-xl space-y-3 p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
          <ScanLine className="size-4 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground">{titulo}</h3>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
            {texto}
          </p>
        </div>
      </div>

      <div className="hidden items-center gap-3 md:flex">
        <QrDoApp className="size-24" />
        <div className="min-w-0 space-y-2">
          <p className="text-[11px] leading-snug text-muted-foreground">
            Aponte a câmera do celular. São 10 scans grátis por dia.
          </p>
          <SelosLojas className="flex-col gap-1.5" tamanho={110} />
        </div>
      </div>

      <div className="space-y-1.5 md:hidden">
        <Button asChild className="w-full">
          <Link href="/download">
            <ScanLine />
            Baixar o app
          </Link>
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          10 scans grátis por dia
        </p>
      </div>
    </div>
  );
}

/**
 * Faixa larga, acima de listas (portfólio, coleção). Dá para dispensar, e o
 * dispensar vale só para esta visita (sessionStorage, como a faixa do rodapé):
 * o convite volta na próxima vez.
 */
export function ConviteAppFaixa({
  id,
  titulo,
  texto,
  className,
}: {
  /** Chave do dispensar — uma por lugar onde a faixa aparece */
  id: string;
  titulo: string;
  texto: string;
  className?: string;
}) {
  const chave = `mf:convite-app:${id}`;
  // Começa escondida para não piscar antes de ler o storage
  const [dispensada, setDispensada] = useState(true);

  useEffect(() => {
    try {
      setDispensada(sessionStorage.getItem(chave) === "1");
    } catch {
      setDispensada(false); // storage bloqueado: mostra assim mesmo
    }
  }, [chave]);

  function dispensar() {
    setDispensada(true);
    try {
      sessionStorage.setItem(chave, "1");
    } catch {
      /* sem storage: volta no próximo carregamento, tudo bem */
    }
  }

  if (dispensada) return null;

  return (
    <div
      className={cn(
        "glass-card !rounded-xl relative flex items-center gap-4 p-4 pr-10",
        className,
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
        <ScanLine className="size-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-foreground">{titulo}</h3>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
          {texto}
        </p>
        <Button asChild size="sm" className="mt-3 md:hidden">
          <Link href="/download">Baixar o app</Link>
        </Button>
      </div>

      <div className="hidden items-center gap-3 md:flex">
        <p className="max-w-[9rem] text-right text-[11px] leading-snug text-muted-foreground">
          Aponte a câmera do celular para baixar
        </p>
        <QrDoApp className="size-20" />
      </div>

      <button
        type="button"
        onClick={dispensar}
        aria-label="Dispensar"
        className="absolute top-2.5 right-2.5 p-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
