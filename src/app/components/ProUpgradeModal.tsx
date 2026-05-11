"use client";

import { DialogClose } from "@radix-ui/react-dialog";
import {
  Camera,
  FolderOpen,
  SlidersHorizontal,
  TrendingUp,
  X,
} from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { QRCode } from "@/components/ui/qrcode";

const APP_STORE_URL = "https://apps.apple.com/app/mint-foil";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=app.mintfoil";

// URL universal de download — redireciona para a store correta conforme o dispositivo
const DOWNLOAD_URL = "https://mintfoil.app/download";

const features = [
  {
    icon: Camera,
    title: "Scans de IA Ilimitados",
    description: "Identifique qualquer carta sem limites diários",
  },
  {
    icon: FolderOpen,
    title: "Portfólios Ilimitados",
    description: "Organize sua coleção sem restrições",
  },
  {
    icon: SlidersHorizontal,
    title: "Filtros de Preço Avançados",
    description: "Encontre cartas dentro do seu orçamento",
  },
  {
    icon: TrendingUp,
    title: "Acompanhamento de P&L",
    description: "Veja ganhos e perdas com dados históricos de preços",
  },
];

export function ProUpgradeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md p-0 overflow-hidden gap-0"
      >
        <DialogTitle className="sr-only">Mint Foil PRO</DialogTitle>

        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 px-8 pt-8 pb-7 text-center relative">
          <DialogClose asChild>
            <button
              type="button"
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </button>
          </DialogClose>

          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-emerald-400 font-bold text-sm tracking-wide">
              MINT FOIL PRO
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            Leve sua coleção a{" "}
            <span className="text-emerald-400">outro nível</span>
          </h2>
          <p className="text-emerald-100/70 text-sm mt-2">
            Desbloqueie recursos exclusivos no app
          </p>
        </div>

        {/* Features */}
        <div className="px-6 pt-5 pb-4 space-y-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-3">
              <div className="size-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <feature.icon className="size-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {feature.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 pt-2 space-y-4">
          {/* QR code — visível apenas em desktop */}
          <div className="hidden sm:flex flex-col items-center gap-2">
            <div className="size-28 p-2 rounded-xl border border-border bg-background">
              <QRCode data={DOWNLOAD_URL} robustness="M" />
            </div>
            <p className="text-xs text-muted-foreground">
              Escaneie para baixar no celular
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-90 hover:opacity-100 transition-opacity"
            >
              <Image
                src="/logos/app-store-apple.svg"
                alt="Download on the App Store"
                width={150}
                height={44}
              />
            </a>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-90 hover:opacity-100 transition-opacity"
            >
              <Image
                src="/logos/app-google-play.svg"
                alt="Get it on Google Play"
                width={150}
                height={44}
              />
            </a>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Assinaturas disponíveis somente pelo app
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
