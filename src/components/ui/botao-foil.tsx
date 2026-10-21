import { Slot } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A ação principal do sistema: pílula com o degradê da marca correndo
 * (mfFoilShift, globals.css) e um brilho rosa em volta. Nasceu como o "Baixar
 * o app" da barra; virou componente para os estados vazios e qualquer outra
 * ação principal usarem a mesma (21/10). A secundária é a GlassPill.
 *
 * `asChild` para virar Link sem perder o visual.
 */
export function BotaoFoil({
  asChild = false,
  className,
  style,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      {...(!asChild && { type: "button" as const })}
      className={cn(
        "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-4 text-sm font-bold text-white transition-transform hover:scale-[1.03] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      style={{
        background:
          "linear-gradient(110deg, #B50D57 0%, #F856A7 35%, #887CFD 65%, #B50D57 100%)",
        backgroundSize: "200% 200%",
        animation: "mfFoilShift 5s linear infinite",
        boxShadow: "0 4px 18px rgba(248, 86, 167, 0.4)",
        ...style,
      }}
      {...props}
    />
  );
}
