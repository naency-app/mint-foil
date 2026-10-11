"use client";

import {
  BadgeCheck,
  Camera,
  FileDown,
  FolderOpen,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { QrDoApp, SelosLojas } from "./ConviteApp";

const features = [
  {
    icon: Camera,
    title: "Scans Ilimitados",
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
    icon: BadgeCheck,
    title: "Selo de Assinante",
    description: "Check azul no seu nome, no perfil, nas listas e no showcase",
  },
  {
    icon: FileDown,
    title: "Exportar em Planilha",
    description:
      "Baixe a coleção inteira em .xlsx, uma aba por portfólio, pronta pro Excel",
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
        <div className="bg-gradient-to-br from-pink-950 via-pink-900 to-slate-900 px-8 pt-8 pb-7 text-center relative">
          <DialogClose asChild>
            <button
              type="button"
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </button>
          </DialogClose>

          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-primary font-bold text-sm tracking-wide">
              MINT FOIL PRO
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            Leve sua coleção a <span className="text-primary">outro nível</span>
          </h2>
          <p className="text-pink-100/70 text-sm mt-2">
            Desbloqueie recursos exclusivos no app
          </p>
        </div>

        {/* Features */}
        <div className="px-6 pt-5 pb-4 space-y-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-3">
              <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <feature.icon className="size-4 text-primary" />
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
            <QrDoApp className="size-28" />
            <p className="text-xs text-muted-foreground">
              Escaneie para baixar no celular
            </p>
          </div>

          <SelosLojas className="justify-center" origem="pro" />
          <p className="text-center text-xs text-muted-foreground">
            Assinaturas disponíveis somente pelo app
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
