"use client";

import {
  type MotionValue,
  motion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect } from "react";

/** Mola curta: o número acompanha o clique, não fica balançando depois. */
const SPRING = { stiffness: 260, damping: 30, mass: 0.6 };

function Digit({
  mv,
  digit,
  height,
}: {
  mv: MotionValue<number>;
  digit: number;
  height: number;
}) {
  const y = useTransform(mv, (latest) => {
    const place = latest % 10;
    const offset = (10 + digit - place) % 10;
    let memo = offset * height;
    // Mais de meia volta: vai pelo outro lado. É o que faz 9 → 0 subir um
    // passo em vez de desenrolar os nove algarismos no caminho.
    if (offset > 5) memo -= 10 * height;
    return memo;
  });

  return (
    <motion.span
      className="absolute inset-0 flex items-center justify-center"
      style={{ y }}
    >
      {digit}
    </motion.span>
  );
}

function Place({
  place,
  value,
  height,
}: {
  place: number;
  value: number;
  height: number;
}) {
  const rounded = Math.floor(value / place);
  const animated = useSpring(rounded, SPRING);

  useEffect(() => {
    animated.set(rounded);
  }, [animated, rounded]);

  return (
    <span
      className="relative inline-flex overflow-hidden tabular-nums"
      style={{ height, width: "1ch" }}
    >
      {Array.from({ length: 10 }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: o índice É o algarismo — a tira 0-9 é fixa
        <Digit key={i} mv={animated} digit={i} height={height} />
      ))}
    </span>
  );
}

interface RollingNumberProps {
  value: number;
  /** Em px — define também a altura da janela de cada algarismo. */
  fontSize?: number;
  className?: string;
}

/**
 * Contador com algarismos rolantes, par do `components/rolling-number.tsx` do
 * app. Só os dígitos se movem: um rótulo ao lado ("Quant.") fica parado, para
 * o olho seguir o que mudou em vez de um texto inteiro pulsando.
 *
 * Cada casa decimal tem a própria mola, então 9 → 10 rola a unidade e traz a
 * dezena junto, sem redesenhar o número.
 */
export function RollingNumber({
  value,
  fontSize = 12,
  className,
}: RollingNumberProps) {
  const safe = Math.max(0, Math.round(value));
  const height = Math.ceil(fontSize * 1.35);
  // [100, 10, 1] para 3 algarismos, [10, 1] para 2, e assim por diante
  const digits = String(safe).length;
  const places = Array.from(
    { length: digits },
    (_, i) => 10 ** (digits - 1 - i),
  );

  return (
    <span
      className={`inline-flex leading-none ${className ?? ""}`}
      style={{ fontSize, height }}
    >
      {places.map((place) => (
        <Place key={place} place={place} value={safe} height={height} />
      ))}
    </span>
  );
}
