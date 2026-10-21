"use client";

import { motion, useReducedMotion } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Pilha de três placas em perspectiva, com o ícone na da frente: a arte de
 * todo estado vazio do produto (EstadoVazio). As placas se desenham em
 * sequência e um brilho percorre a borda, a menos que a pessoa peça menos
 * movimento no sistema.
 *
 * Veio pronto do usuário (21/10); aqui só mudou o que era do outro design
 * system: o ícone é qualquer componente de ícone (Lucide ou Tabler), as cores
 * são os tokens do Mint Foil e classMerge virou cn.
 */

type IconeDoStack = React.ComponentType<{ className?: string }>;

type IconStackIconProps = { icon: IconeDoStack };

type IconStackSize = "sm" | "md" | "lg";

const sizeVariants: Record<IconStackSize, string> = {
  sm: "h-16 w-14",
  md: "h-20 w-[72px]",
  lg: "h-28 w-24",
};

const iconSizeVariants: Record<IconStackSize, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

type IconStackColor =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "critical";

const colorVariants: Record<IconStackColor, string> = {
  neutral: "text-foreground",
  primary: "text-primary",
  success: "text-emerald-500",
  warning: "text-amber-500",
  critical: "text-destructive",
};

const iconColorVariants: Record<IconStackColor, string> = {
  neutral: "text-muted-foreground",
  primary: "text-primary",
  success: "text-emerald-500",
  warning: "text-amber-500",
  critical: "text-destructive",
};

const IconStackContext = React.createContext<{
  size: IconStackSize;
  color: IconStackColor;
}>({ size: "md", color: "neutral" });

type IconStackProps = Omit<React.ComponentProps<"div">, "children"> & {
  isAnimated?: boolean;
  size?: IconStackSize;
  color?: IconStackColor;
  children?: React.ReactElement<IconStackIconProps>;
};

const EDGE_PATH =
  "M42.2538 2.046C41.4408 1.6325 40.3965 1.6677 39.2612 2.2424L7.9616 18.1934C5.3895 19.5039 3.301 23.1064 3.301 26.2322V64.3226C3.301 66.0677 3.9458 67.2943 4.962 67.8199L1.8363 66.229C0.8201 65.7104 0.1753 64.4771 0.1753 62.732V24.6412C0.1753 21.5085 2.2638 17.913 4.8359 16.6024L36.1355 0.6515C37.2778 0.0698 38.322 0.0416 39.128 0.4551L42.2538 2.046Z";
const FACE_PATH =
  "M42.2545 2.0456C43.2707 2.5643 43.9155 3.7979 43.9155 5.543V43.6337C43.9155 46.7665 41.827 50.3616 39.2549 51.6722L7.9554 67.6235C6.813 68.2052 5.7687 68.2331 4.9628 67.8196C3.9465 67.301 3.3018 66.0673 3.3018 64.3222V26.2318C3.3018 23.0991 5.3903 19.5036 7.9624 18.193L39.2619 2.2421C40.4043 1.6604 41.4486 1.6321 42.2545 2.0456Z";

const LAYERS = [
  { opacity: "0.4", x: 0, y: 0 },
  { opacity: "0.6", x: 13.65, y: 6.04 },
  { opacity: "0.8", x: 27.32, y: 12.08, isActive: true },
] as const;

const LAYER_DRAW_DURATION_S = 0.7;
const LAYER_STAGGER_S = 0.18;
const CONTENT_DELAY_S = LAYER_STAGGER_S * 2 + LAYER_DRAW_DURATION_S * 0.6;
const SHINE_START_S = LAYER_STAGGER_S * 2 + LAYER_DRAW_DURATION_S;
const SHINE_DURATION_S = 4.5;
const SHINE_LENGTH = 0.14;

function IconStackLayer({
  isActive = false,
  opacity,
  x = 0,
  y = 0,
  delay = 0,
  isAnimated,
}: {
  isActive?: boolean;
  opacity: string;
  x?: number;
  y?: number;
  delay?: number;
  isAnimated: boolean;
}) {
  const draw = isAnimated
    ? {
        initial: { pathLength: 0, opacity: 0 },
        animate: { pathLength: 1, opacity: 1 },
        transition: {
          duration: LAYER_DRAW_DURATION_S,
          delay,
          ease: "easeInOut" as const,
        },
      }
    : {};

  return (
    <g opacity={opacity} transform={`translate(${x} ${y})`}>
      <motion.path
        {...draw}
        data-slot="icon-stack-layer"
        d={EDGE_PATH}
        stroke="currentColor"
        strokeOpacity={isActive ? "0.3" : "0.2"}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.path
        {...draw}
        data-slot="icon-stack-layer"
        d={FACE_PATH}
        stroke="currentColor"
        strokeOpacity={isActive ? "0.3" : "0.2"}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {isAnimated && (
        <motion.path
          d={FACE_PATH}
          pathLength={1}
          fill="none"
          stroke="currentColor"
          strokeOpacity={isActive ? "0.7" : "0.45"}
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray={`${SHINE_LENGTH} ${1 - SHINE_LENGTH}`}
          initial={{ strokeDashoffset: 1, opacity: 0 }}
          animate={{ strokeDashoffset: 0, opacity: 1 }}
          transition={{
            opacity: { duration: 1.2, delay: SHINE_START_S + delay * 3 },
            strokeDashoffset: {
              duration: SHINE_DURATION_S,
              delay: SHINE_START_S + delay * 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
          }}
        />
      )}
    </g>
  );
}

function IconStackRoot({
  className,
  children,
  style,
  isAnimated = true,
  size = "md",
  color = "neutral",
  ...props
}: IconStackProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = isAnimated && !prefersReducedMotion;

  return (
    <IconStackContext.Provider value={{ size, color }}>
      <div
        data-slot="icon-stack"
        className={cn(
          // Placas cheias com a cor dos cards: a de trás não aparece através
          // da da frente
          "relative [&_[data-slot=icon-stack-layer]]:fill-card",
          sizeVariants[size],
          colorVariants[color],
          className,
        )}
        style={
          {
            "--icon-stack-content-x": "71%",
            "--icon-stack-content-y": "58%",
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 72 81"
          fill="none"
          className="h-full w-full overflow-visible"
        >
          <ellipse
            cx="36"
            cy="76"
            rx="30"
            ry="7"
            fill="currentColor"
            fillOpacity="0.055"
            className="blur-[4px]"
          />
          {LAYERS.map((layer, index) => (
            <IconStackLayer
              key={layer.opacity}
              {...layer}
              delay={LAYER_STAGGER_S * index}
              isAnimated={shouldAnimate}
            />
          ))}
        </svg>

        {children ? (
          <motion.div
            {...(shouldAnimate && {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { duration: 0.3, delay: CONTENT_DELAY_S },
            })}
            data-slot="icon-stack-content"
            className="pointer-events-none absolute top-[var(--icon-stack-content-y)] left-[var(--icon-stack-content-x)]"
          >
            <div className="-translate-x-1/2 -translate-y-1/2 -skew-y-[26deg] flex scale-x-90 items-center justify-center">
              {children}
            </div>
          </motion.div>
        ) : null}
      </div>
    </IconStackContext.Provider>
  );
}

function IconStackIcon({ icon: Icone }: IconStackIconProps) {
  const { size, color } = React.use(IconStackContext);
  return (
    <Icone className={cn(iconSizeVariants[size], iconColorVariants[color])} />
  );
}

export const IconStack = Object.assign(IconStackRoot, { Icon: IconStackIcon });

export type {
  IconStackProps,
  IconStackIconProps,
  IconStackSize,
  IconStackColor,
};
