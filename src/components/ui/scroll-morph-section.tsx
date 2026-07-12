"use client";

import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

// --- Types ---
type IntroPhase = "scatter" | "line" | "circle";

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

const lerp = (start: number, end: number, t: number) =>
  start * (1 - t) + end * t;

/**
 * Seção scroll-morph dirigida pelo scroll REAL da página (sticky, sem
 * sequestrar a rolagem): as cartas entram espalhadas, viram um círculo e,
 * conforme a página rola, o círculo vira um arco que gira desfilando as
 * cartas — com as frases-chave no meio.
 */
export default function ScrollMorphSection({
  isDark = false,
  introTitle = "Toda coleção tem tesouros escondidos.",
  introHint = "CONTINUE ROLANDO",
  arcTitle = "A sua vale quanto?",
  arcSubtitle = "Escaneie e descubra — preço em reais, atualizado todo dia.",
}: {
  isDark?: boolean;
  introTitle?: string;
  introHint?: string;
  arcTitle?: string;
  arcSubtitle?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [introPhase, setIntroPhase] = useState<IntroPhase>("scatter");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const textMain = isDark ? "#FFFFFF" : "#020617";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(2,6,23,0.5)";

  // --- Tamanho do container sticky ---
  useEffect(() => {
    if (!stickyRef.current) return;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(stickyRef.current);

    setContainerSize({
      width: stickyRef.current.offsetWidth,
      height: stickyRef.current.offsetHeight,
    });

    return () => observer.disconnect();
  }, []);

  // --- Intro (espalhadas → linha → círculo) quando a seção entra na tela ---
  const inView = useInView(wrapperRef, { amount: 0.15, once: true });

  useEffect(() => {
    if (!inView) return;
    const timer1 = setTimeout(() => setIntroPhase("line"), 400);
    const timer2 = setTimeout(() => setIntroPhase("circle"), 2000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [inView]);

  // --- Progresso pelo scroll real da página ---
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // 0 → 0.3: círculo vira arco · 0.3 → 1: arco gira
  const morphProgress = useTransform(scrollYProgress, [0.05, 0.3], [0, 1]);
  const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });

  const arcSpin = useTransform(scrollYProgress, [0.3, 1], [0, 1]);
  const smoothArcSpin = useSpring(arcSpin, { stiffness: 40, damping: 20 });

  // --- Parallax do mouse ---
  const [parallaxValue, setParallaxValue] = useState(0);

  useEffect(() => {
    const sticky = stickyRef.current;
    if (!sticky) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = sticky.getBoundingClientRect();
      const normalizedX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      setParallaxValue(normalizedX * 100);
    };
    sticky.addEventListener("mousemove", handleMouseMove);
    return () => sticky.removeEventListener("mousemove", handleMouseMove);
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

  // --- Valores derivados (para o cálculo manual do morph) ---
  const [morphValue, setMorphValue] = useState(0);
  const [spinValue, setSpinValue] = useState(0);

  useEffect(() => {
    const unsubMorph = smoothMorph.on("change", setMorphValue);
    const unsubSpin = smoothArcSpin.on("change", setSpinValue);
    return () => {
      unsubMorph();
      unsubSpin();
    };
  }, [smoothMorph, smoothArcSpin]);

  // --- Conteúdo do arco (aparece quando o arco forma) ---
  const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1]);
  const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0]);

  return (
    // Altura extra = distância de rolagem da animação; o miolo fica sticky
    <div ref={wrapperRef} style={{ height: "280vh", position: "relative" }}>
      <div
        ref={stickyRef}
        className="sticky top-0 h-svh w-full overflow-hidden"
      >
        <div className="flex h-full w-full flex-col items-center justify-center">
          {/* Frase de intro (some no morph) */}
          <div className="pointer-events-none absolute top-1/2 z-0 flex -translate-y-1/2 flex-col items-center justify-center px-4 text-center">
            <motion.h2
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
              {introTitle}
            </motion.h2>
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
              {introHint}
            </motion.p>
          </div>

          {/* Frase do arco */}
          <motion.div
            style={{ opacity: contentOpacity, y: contentY }}
            className="pointer-events-none absolute top-[14%] z-10 flex flex-col items-center justify-center px-4 text-center"
          >
            <h2
              className="mb-4 text-3xl font-semibold tracking-tight md:text-5xl"
              style={{ color: textMain }}
            >
              {arcTitle}
            </h2>
            <p
              className="max-w-lg text-sm leading-relaxed md:text-base"
              style={{ color: textMuted }}
            >
              {arcSubtitle}
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
                const arcApexY =
                  containerSize.height * (isMobile ? 0.35 : 0.25);
                const arcCenterY = arcApexY + arcRadius;
                const spreadAngle = isMobile ? 100 : 130;
                const startAngle = -90 - spreadAngle / 2;
                const step = spreadAngle / (TOTAL_IMAGES - 1);

                const maxRotation = spreadAngle * 0.8;
                const boundedRotation = -spinValue * maxRotation;

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
                  rotation: lerp(
                    circlePos.rotation,
                    arcPos.rotation,
                    morphValue,
                  ),
                  scale: lerp(1, arcPos.scale, morphValue),
                  opacity: 1,
                };
              }

              return <FlipCard key={src} src={src} target={target} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
