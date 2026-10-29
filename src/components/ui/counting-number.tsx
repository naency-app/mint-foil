"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * Número que conta até o valor novo quando ele muda — o TOTAL da carta ao
 * adicionar/remover (26/10). Na primeira renderização já mostra o valor, sem
 * contar do zero; só as mudanças animam. Com "reduzir movimento", troca direto.
 *
 * O valor vive num MotionValue e o texto é derivado dele: atualiza a cada
 * quadro sem re-render do React.
 */
export function CountingNumber({
  value,
  from,
  duration = 800,
  decimals = 0,
  grouping = true,
  className,
}: {
  value: number;
  /** De onde começa na primeira renderização; padrão: o próprio valor */
  from?: number;
  /** Em milissegundos */
  duration?: number;
  decimals?: number;
  /** Separador de milhar (1.234) */
  grouping?: boolean;
  className?: string;
}) {
  const numero = useMotionValue(from ?? value);
  const texto = useTransform(numero, (n) =>
    n.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: grouping,
    }),
  );
  const reduzir = useReducedMotion();

  useEffect(() => {
    if (reduzir) {
      numero.set(value);
      return;
    }
    const controle = animate(numero, value, {
      duration: duration / 1000,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controle.stop();
  }, [numero, value, duration, reduzir]);

  return (
    <motion.span className={cn("tabular-nums", className)}>{texto}</motion.span>
  );
}
