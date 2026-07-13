"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
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
const IMG_WIDTH = 92;
const IMG_HEIGHT = 129;

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
 * Seção scroll-morph pinada (mesmo modelo do CinematicHero): o miolo fica
 * grudado na tela enquanto o scroll da página percorre o wrapper alto — a
 * interação (círculo → arco → giro → saída, com as duas frases) consome toda
 * essa distância e a página só passa pra próxima seção quando ela termina.
 */
export default function ScrollMorphSection({
  isDark = false,
  introTitle = "Toda coleção tem tesouros escondidos.",
  introHint = "CONTINUE ROLANDO",
  arcTitle = "Quanto vale a sua?",
  arcSubtitle = "Escaneie e descubra — preço em reais, atualizado todo dia.",
}: {
  isDark?: boolean;
  introTitle?: string;
  introHint?: string;
  arcTitle?: string;
  arcSubtitle?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [introPhase, setIntroPhase] = useState<IntroPhase>("scatter");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const textMain = isDark ? "#FFFFFF" : "#020617";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(2,6,23,0.5)";

  // --- Tamanho do container ---
  useEffect(() => {
    if (!sectionRef.current) return;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(sectionRef.current);

    setContainerSize({
      width: sectionRef.current.offsetWidth,
      height: sectionRef.current.offsetHeight,
    });

    return () => observer.disconnect();
  }, []);

  // --- Intro (espalhadas → linha → círculo) quando a seção aparece ---
  const [introStarted, setIntroStarted] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIntroStarted(true);
      },
      // Dispara assim que o wrapper encosta na vista — a intro roda enquanto
      // a seção ainda está entrando, e o círculo já chega pronto no pin
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!introStarted) return;
    const timer1 = setTimeout(() => setIntroPhase("line"), 200);
    const timer2 = setTimeout(() => setIntroPhase("circle"), 1100);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [introStarted]);

  // --- Progresso pinado: o wrapper alto define a distância da interação ---
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // Círculo + frase 1 seguram até 28% · morph 28–50% · giro 50–82% ·
  // saída 82–97% (cartas somem, frase 2 centraliza) · 97–100% respiro
  const morphProgress = useTransform(scrollYProgress, [0.28, 0.5], [0, 1]);
  const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });

  const arcSpin = useTransform(scrollYProgress, [0.5, 0.82], [0, 1]);
  const smoothArcSpin = useSpring(arcSpin, { stiffness: 40, damping: 20 });

  const exitProgress = useTransform(scrollYProgress, [0.82, 0.97], [0, 1]);
  const smoothExit = useSpring(exitProgress, { stiffness: 40, damping: 20 });

  // --- Parallax do mouse ---
  const [parallaxValue, setParallaxValue] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const normalizedX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      setParallaxValue(normalizedX * 100);
    };
    section.addEventListener("mousemove", handleMouseMove);
    return () => section.removeEventListener("mousemove", handleMouseMove);
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
  const [exitValue, setExitValue] = useState(0);

  useEffect(() => {
    const unsubMorph = smoothMorph.on("change", setMorphValue);
    const unsubSpin = smoothArcSpin.on("change", setSpinValue);
    const unsubExit = smoothExit.on("change", setExitValue);
    return () => {
      unsubMorph();
      unsubSpin();
      unsubExit();
    };
  }, [smoothMorph, smoothArcSpin, smoothExit]);

  // --- Frase do arco (aparece quando o arco forma) ---
  const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1]);

  return (
    // Altura extra = distância que o scroll percorre com a seção pinada
    <div ref={wrapperRef} style={{ height: "320vh", position: "relative" }}>
      <div
        ref={sectionRef}
        className="sticky top-0 h-svh w-full overflow-hidden"
      >
        <div className="flex h-full w-full flex-col items-center justify-center">
          {/* Frase 1 — no círculo (some no morph) */}
          <div className="pointer-events-none absolute top-1/2 z-20 flex -translate-y-1/2 flex-col items-center justify-center px-4 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={
                introPhase === "circle" && morphValue < 0.5
                  ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, filter: "blur(10px)" }
              }
              transition={{ duration: 1 }}
              className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl"
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
              className="mt-5 text-[11px] font-bold tracking-[0.3em] md:text-xs"
              style={{ color: textMuted }}
            >
              {introHint}
            </motion.p>
          </div>

          {/* Frase 2 — no arco */}
          <motion.div
            style={{
              opacity: contentOpacity,
              top: `${7 + exitValue * 43}%`,
              translateY: `${exitValue * -50}%`,
              scale: 1 + exitValue * 0.12,
            }}
            className="pointer-events-none absolute z-30 flex flex-col items-center justify-center px-4 text-center"
          >
            <h2
              className="mb-3 text-4xl font-extrabold tracking-tight md:text-6xl"
              style={{ color: textMain }}
            >
              {arcTitle}
            </h2>
            <p
              className="max-w-lg text-sm font-medium leading-relaxed md:text-lg"
              style={{ color: textMuted }}
            >
              {arcSubtitle}
            </p>
          </motion.div>

          {/* Cartas */}
          <div className="relative z-10 flex h-full w-full items-center justify-center">
            {IMAGES.slice(0, TOTAL_IMAGES).map((src, i) => {
              let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

              if (introPhase === "scatter") {
                target = scatterPositions[i];
              } else if (introPhase === "line") {
                const lineSpacing = 104;
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
                const circleRadius = Math.min(minDimension * 0.38, 400);
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
                  containerSize.height * (isMobile ? 0.44 : 0.36);
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
                  scale: isMobile ? 1.15 : 1.45,
                };

                // C. Interpolação (morph) + saída final (fica só a frase)
                target = {
                  x: lerp(circlePos.x, arcPos.x, morphValue),
                  y: lerp(circlePos.y, arcPos.y, morphValue) + exitValue * 140,
                  rotation: lerp(
                    circlePos.rotation,
                    arcPos.rotation,
                    morphValue,
                  ),
                  scale:
                    lerp(1, arcPos.scale, morphValue) * (1 - exitValue * 0.35),
                  opacity: 1 - exitValue,
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
