"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type SummonGlow = "cyan" | "orange" | "pink" | "red";

// Literal classes per glow so Tailwind can see them
const GLOWS: Record<
  SummonGlow,
  { character: string; aura: string; chip: string; strongChip: string }
> = {
  cyan: {
    character: "drop-shadow-[0_0_44px_rgba(56,189,248,0.85)]",
    aura: "bg-sky-400/25",
    chip: "ring-sky-300/30",
    strongChip: "text-sky-300",
  },
  orange: {
    character: "drop-shadow-[0_0_44px_rgba(251,146,60,0.85)]",
    aura: "bg-orange-400/25",
    chip: "ring-orange-300/30",
    strongChip: "text-orange-300",
  },
  pink: {
    character: "drop-shadow-[0_0_44px_rgba(248,86,167,0.85)]",
    aura: "bg-pink-400/25",
    chip: "ring-pink-300/30",
    strongChip: "text-pink-300",
  },
  red: {
    character: "drop-shadow-[0_0_44px_rgba(239,68,68,0.85)]",
    aura: "bg-red-500/25",
    chip: "ring-red-300/30",
    strongChip: "text-red-300",
  },
};

export interface SummonChip {
  id: string;
  label: string;
  /** Destaque (ex.: o preço) — maior e colorido */
  strong?: boolean;
}

/**
 * Carta de TCG virada pra baixo. No hover (ou toque) ela flipa revelando a
 * frente, o personagem sobe da carta em 3D e os valores aparecem flutuando
 * ao lado — estilo invocação de Yu-Gi-Oh.
 */
export const CardSummon = ({
  back,
  front,
  character,
  characterShape = "cutout",
  alt,
  glow = "cyan",
  chips = [],
  className,
}: {
  /** Verso da carta (mostrado em repouso) */
  back: string;
  /** Frente da carta (revelada no hover) */
  front: string;
  /** Arte do personagem com fundo transparente */
  character: string;
  /** "cutout" para PNG transparente; "orb" aplica máscara esfumada (arte sem recorte) */
  characterShape?: "cutout" | "orb";
  alt: string;
  glow?: SummonGlow;
  chips?: SummonChip[];
  className?: string;
}) => {
  const [revealed, setRevealed] = useState(false);
  const g = GLOWS[glow];

  return (
    <button
      type="button"
      aria-label={`Revelar ${alt}`}
      onClick={() => setRevealed((r) => !r)}
      className={cn(
        "group relative block cursor-pointer border-none bg-transparent p-0",
        className,
      )}
      style={{ perspective: "1200px" }}
    >
      {/* Aura no chão */}
      <div
        className={cn(
          "pointer-events-none absolute -bottom-6 left-1/2 h-16 w-64 -translate-x-1/2 rounded-[50%] blur-2xl transition-opacity duration-700",
          g.aura,
          revealed ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      />

      {/* Personagem — sobe da carta em 3D */}
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-0 z-30 -translate-x-1/2 transition-all duration-700 ease-out",
          revealed
            ? "-translate-y-[58%] scale-100 opacity-100 delay-300"
            : "translate-y-16 scale-[0.35] opacity-0 group-hover:-translate-y-[58%] group-hover:scale-100 group-hover:opacity-100 group-hover:delay-300",
        )}
      >
        <div className="[animation:floatY_3.4s_ease-in-out_infinite]">
          {/* biome-ignore lint/performance/noImgElement: arte decorativa da landing, sem otimização next/image */}
          <img
            src={character}
            alt=""
            className={cn(
              characterShape === "orb"
                ? "h-44 w-60 max-w-none object-cover [mask-image:radial-gradient(ellipse_at_center,black_52%,transparent_74%)]"
                : "h-56 w-auto object-contain",
              g.character,
            )}
          />
        </div>
      </div>

      {/* Carta — deitada na mesa; no hover flipa revelando a frente */}
      <div
        className={cn(
          "relative h-[330px] w-[236px] transition-transform duration-700 [transform:rotateX(38deg)] [transform-style:preserve-3d]",
          revealed
            ? "[transform:rotateX(38deg)_rotateY(180deg)]"
            : "group-hover:[transform:rotateX(38deg)_rotateY(180deg)]",
        )}
        style={{ transformOrigin: "50% 65%" }}
      >
        {/* Verso */}
        <div className="absolute inset-0 overflow-hidden rounded-xl shadow-[0_18px_50px_rgba(0,0,0,0.35)] [backface-visibility:hidden]">
          {/* biome-ignore lint/performance/noImgElement: arte decorativa da landing, sem otimização next/image */}
          <img src={back} alt="" className="h-full w-full object-cover" />
        </div>
        {/* Frente */}
        <div className="absolute inset-0 overflow-hidden rounded-xl shadow-[0_18px_50px_rgba(0,0,0,0.35)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {/* biome-ignore lint/performance/noImgElement: arte decorativa da landing, sem otimização next/image */}
          <img src={front} alt={alt} className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Valores flutuando ao lado, em 3D */}
      <div
        className="pointer-events-none absolute -right-6 top-1/2 z-40 flex translate-x-full flex-col items-start gap-2.5"
        style={{ transform: "translateX(100%) rotateY(-14deg)" }}
      >
        {chips.map((chip, i) => (
          <div
            key={chip.id}
            className={cn(
              "transition-all duration-500 ease-out",
              revealed
                ? "translate-x-0 opacity-100"
                : "translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
            )}
            style={{ transitionDelay: `${350 + i * 120}ms` }}
          >
            <div
              className="[animation:floatY_3s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.45}s` }}
            >
              <span
                className={cn(
                  "block whitespace-nowrap rounded-full bg-zinc-950/85 shadow-lg ring-1 backdrop-blur-sm",
                  g.chip,
                  chip.strong
                    ? cn("px-4 py-1.5 text-base font-extrabold", g.strongChip)
                    : "px-3 py-1 text-[11px] font-semibold text-white/85",
                )}
              >
                {chip.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </button>
  );
};
