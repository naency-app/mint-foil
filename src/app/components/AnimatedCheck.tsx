"use client";

import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { useEffect, useRef } from "react";
import animationData from "@/assets/animations/check-success.json";

/** Duração real do arquivo: 72 frames a 24 fps. */
const SOURCE_DURATION_MS = 3000;

/**
 * O quadro é desenhado maior que a caixa para as ondas terem onde acontecer,
 * e o excedente é recortado — assim a animação não passa da borda do botão.
 */
const FRAME_SCALE = 1.55;

interface AnimatedCheckProps {
  /** Lado da caixa, em px — normalmente o tamanho do botão que ela ocupa. */
  size?: number;
  duration?: number;
  className?: string;
}

/**
 * Confirmação de "adicionado": anel se desenhando, disco preenchendo, duas
 * ondas e o check traçado. Par do `components/animated-check.tsx` do app —
 * mesmo arquivo do LottieFiles, mesma duração, mesmo enquadramento.
 *
 * Anima ao montar. Para repetir com ela já na tela, troque a `key` do elemento.
 */
export function AnimatedCheck({
  size = 28,
  duration = 1500,
  className,
}: AnimatedCheckProps) {
  const frameSize = size * FRAME_SCALE;
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    // O arquivo tem 3s; a velocidade encaixa na duração pedida
    lottieRef.current?.setSpeed(SOURCE_DURATION_MS / duration);
  }, [duration]);

  return (
    // Cobre o botão inteiro em vez de ocupar espaço no fluxo: assim a borda e o
    // padding do botão não deslocam a animação, e o recorte segue o formato
    // redondo do alvo.
    <span
      className={`absolute inset-0 overflow-hidden rounded-full ${className ?? ""}`}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay
        style={{
          position: "absolute",
          // Ancorado no centro do botão, não num canto calculado
          left: "50%",
          top: "50%",
          width: frameSize,
          height: frameSize,
          transform: "translate(-50%, -50%)",
        }}
      />
    </span>
  );
}
