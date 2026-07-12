"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

// --- Types ---
export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

interface FlipCardProps {
  src: string;
  target: {
    x: number;
    y: number;
    rotation: number;
    scale: number;
    opacity: number;
  };
}

// --- FlipCard ---
const IMG_WIDTH = 60;
const IMG_HEIGHT = 85;

function FlipCard({ src, target }: FlipCardProps) {
  return (
    <motion.div
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={{
        type: "spring",
        stiffness: 40,
        damping: 15,
      }}
      style={{
        position: "absolute",
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className="group cursor-pointer"
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        whileHover={{ rotateY: 180 }}
      >
        {/* Frente — a carta */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-md shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* biome-ignore lint/performance/noImgElement: external TCG card URLs require referrerPolicy */}
          <img
            src={src}
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Verso — marca Mint Foil */}
        <div
          className="absolute inset-0 flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-[#F856A7] to-[#B50D57] shadow-lg"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <span className="text-lg font-extrabold text-white">M</span>
          <span className="mt-0.5 text-[6px] font-bold uppercase tracking-widest text-white/80">
            Mint Foil
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Cartas (mistura dos 4 TCGs; locais + hotlinks já usados na landing) ---
const IMAGES = [
  "/landing/blue-eyes-card.jpg",
  "https://images.pokemontcg.io/swsh7/215_hires.png",
  "/landing/shivan-card.jpg",
  "https://images.pokemontcg.io/sv3/234_hires.png",
  "/landing/luffy-card.png",
  "https://images.ygoprodeck.com/images/cards/46986414.jpg",
  "/landing/charizard-card.png",
  "https://images.pokemontcg.io/swsh4/188_hires.png",
  "https://cards.scryfall.io/large/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7571.jpg",
  "https://images.pokemontcg.io/swsh8/271_hires.png",
  "https://images.ygoprodeck.com/images/cards/33396948.jpg",
  "https://images.pokemontcg.io/pgo/31_hires.png",
  "https://cards.scryfall.io/large/front/4/c/4cbc6901-6a4a-4d0a-83ea-7eefa3b35021.jpg",
  "https://images.pokemontcg.io/swsh11/131_hires.png",
  "https://images.ygoprodeck.com/images/cards/74677422.jpg",
  "https://images.pokemontcg.io/swsh8/270_hires.png",
  "https://cards.scryfall.io/large/front/e/3/e3285e6b-3e79-4d7c-bf96-d920f973b122.jpg",
  "https://images.pokemontcg.io/swsh7/212_hires.png",
  "https://images.ygoprodeck.com/images/cards/38033121.jpg",
  "https://images.pokemontcg.io/swsh45sv/SV107_hires.png",
];

const TOTAL_IMAGES = 20;
const MAX_SCROLL = 2200; // Alcance do scroll virtual

const lerp = (start: number, end: number, t: number) =>
  start * (1 - t) + end * t;

export default function ScrollMorphHero({
  isDark = false,
}: {
  isDark?: boolean;
}) {
  const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const textMain = isDark ? "#FFFFFF" : "#020617";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(2,6,23,0.5)";

  // --- Tamanho do container ---
  useEffect(() => {
    if (!containerRef.current) return;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);

    setContainerSize({
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    });

    return () => observer.disconnect();
  }, []);

  // --- Scroll virtual ---
  const virtualScroll = useMotionValue(0);
  const scrollRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // No fim (ou início), libera o scroll nativo pra página continuar
      const atEnd = scrollRef.current >= MAX_SCROLL && e.deltaY > 0;
      const atStart = scrollRef.current <= 0 && e.deltaY < 0;
      if (atEnd || atStart) return;

      e.preventDefault();
      const newScroll = Math.min(
        Math.max(scrollRef.current + e.deltaY, 0),
        MAX_SCROLL,
      );
      scrollRef.current = newScroll;
      virtualScroll.set(newScroll);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;

      const atEnd = scrollRef.current >= MAX_SCROLL && deltaY > 0;
      const atStart = scrollRef.current <= 0 && deltaY < 0;
      if (atEnd || atStart) return;

      e.preventDefault();
      touchStartY = touchY;
      const newScroll = Math.min(
        Math.max(scrollRef.current + deltaY, 0),
        MAX_SCROLL,
      );
      scrollRef.current = newScroll;
      virtualScroll.set(newScroll);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [virtualScroll]);

  // 1. Morph: 0 (círculo) → 1 (arco inferior), entre scroll 0 e 600
  const morphProgress = useTransform(virtualScroll, [0, 600], [0, 1]);
  const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });

  // 2. Rotação do arco conforme continua rolando
  const scrollRotate = useTransform(virtualScroll, [600, MAX_SCROLL], [0, 360]);
  const smoothScrollRotate = useSpring(scrollRotate, {
    stiffness: 40,
    damping: 20,
  });

  // --- Parallax do mouse ---
  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const normalizedX = (relativeX / rect.width) * 2 - 1;
      mouseX.set(normalizedX * 100);
    };
    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX]);

  // --- Sequência de intro ---
  useEffect(() => {
    const timer1 = setTimeout(() => setIntroPhase("line"), 500);
    const timer2 = setTimeout(() => setIntroPhase("circle"), 2500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // --- Posições aleatórias do scatter ---
  const scatterPositions = useMemo(() => {
    return IMAGES.map(() => ({
      x: (Math.random() - 0.5) * 1500,
      y: (Math.random() - 0.5) * 1000,
      rotation: (Math.random() - 0.5) * 180,
      scale: 0.6,
      opacity: 0,
    }));
  }, []);

  // --- Valores derivados ---
  const [morphValue, setMorphValue] = useState(0);
  const [rotateValue, setRotateValue] = useState(0);
  const [parallaxValue, setParallaxValue] = useState(0);

  useEffect(() => {
    const unsubscribeMorph = smoothMorph.on("change", setMorphValue);
    const unsubscribeRotate = smoothScrollRotate.on("change", setRotateValue);
    const unsubscribeParallax = smoothMouseX.on("change", setParallaxValue);
    return () => {
      unsubscribeMorph();
      unsubscribeRotate();
      unsubscribeParallax();
    };
  }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

  // --- Conteúdo do arco (aparece quando o arco forma) ---
  const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1]);
  const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <div className="perspective-1000 flex h-full w-full flex-col items-center justify-center">
        {/* Texto de intro (some no morph) */}
        <div className="pointer-events-none absolute top-1/2 z-0 flex -translate-y-1/2 flex-col items-center justify-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={
              introPhase === "circle" && morphValue < 0.5
                ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" }
                : { opacity: 0, filter: "blur(10px)" }
            }
            transition={{ duration: 1 }}
            className="text-2xl font-medium tracking-tight md:text-4xl"
            style={{ color: textMain }}
          >
            Suas cartas valem mais do que você imagina.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={
              introPhase === "circle" && morphValue < 0.5
                ? { opacity: 0.5 - morphValue }
                : { opacity: 0 }
            }
            transition={{ duration: 1, delay: 0.2 }}
            className="mt-4 text-xs font-bold tracking-[0.2em]"
            style={{ color: textMuted }}
          >
            ROLE PARA DESCOBRIR
          </motion.p>
        </div>

        {/* Conteúdo do arco */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="pointer-events-none absolute top-[12%] z-10 flex flex-col items-center justify-center px-4 text-center"
        >
          <h2
            className="mb-4 text-3xl font-semibold tracking-tight md:text-5xl"
            style={{ color: textMain }}
          >
            Pokémon, Magic, Yu-Gi-Oh! e One Piece
          </h2>
          <p
            className="max-w-lg text-sm leading-relaxed md:text-base"
            style={{ color: textMuted }}
          >
            Um scanner só pra todas elas.
            <br className="hidden md:block" />
            Continue rolando.
          </p>
        </motion.div>

        {/* Cartas */}
        <div className="relative flex h-full w-full items-center justify-center">
          {IMAGES.slice(0, TOTAL_IMAGES).map((src, i) => {
            let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

            if (introPhase === "scatter") {
              target = scatterPositions[i];
            } else if (introPhase === "line") {
              const lineSpacing = 70;
              const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
              const lineX = i * lineSpacing - lineTotalWidth / 2;
              target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 };
            } else {
              const isMobile = containerSize.width < 768;
              const minDimension = Math.min(
                containerSize.width,
                containerSize.height,
              );

              // A. Círculo
              const circleRadius = Math.min(minDimension * 0.35, 350);
              const circleAngle = (i / TOTAL_IMAGES) * 360;
              const circleRad = (circleAngle * Math.PI) / 180;
              const circlePos = {
                x: Math.cos(circleRad) * circleRadius,
                y: Math.sin(circleRad) * circleRadius,
                rotation: circleAngle + 90,
              };

              // B. Arco inferior ("arco-íris" convexo pra cima)
              const baseRadius = Math.min(
                containerSize.width,
                containerSize.height * 1.5,
              );
              const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);
              const arcApexY = containerSize.height * (isMobile ? 0.35 : 0.25);
              const arcCenterY = arcApexY + arcRadius;
              const spreadAngle = isMobile ? 100 : 130;
              const startAngle = -90 - spreadAngle / 2;
              const step = spreadAngle / (TOTAL_IMAGES - 1);

              const scrollProgress = Math.min(
                Math.max(rotateValue / 360, 0),
                1,
              );
              const maxRotation = spreadAngle * 0.8;
              const boundedRotation = -scrollProgress * maxRotation;

              const currentArcAngle = startAngle + i * step + boundedRotation;
              const arcRad = (currentArcAngle * Math.PI) / 180;

              const arcPos = {
                x: Math.cos(arcRad) * arcRadius + parallaxValue,
                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                rotation: currentArcAngle + 90,
                scale: isMobile ? 1.4 : 1.8,
              };

              // C. Interpolação (morph)
              target = {
                x: lerp(circlePos.x, arcPos.x, morphValue),
                y: lerp(circlePos.y, arcPos.y, morphValue),
                rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                scale: lerp(1, arcPos.scale, morphValue),
                opacity: 1,
              };
            }

            return <FlipCard key={src} src={src} target={target} />;
          })}
        </div>
      </div>
    </div>
  );
}
