"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type React from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INJECTED_STYLES = `
  .mf-gsap-reveal { visibility: hidden; }

  .mf-film-grain {
    position: absolute; inset: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 50; opacity: 0.03; mix-blend-mode: overlay;
    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23n)"/></svg>');
  }

  .mf-text-silver {
    background: linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.5) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: translateZ(0);
    filter:
      drop-shadow(0px 8px 20px rgba(0,0,0,0.15))
      drop-shadow(0px 2px 4px rgba(0,0,0,0.08));
  }

  .mf-card-silver {
    background: linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: translateZ(0);
    filter:
      drop-shadow(0px 10px 22px rgba(0,0,0,0.8))
      drop-shadow(0px 3px 6px rgba(0,0,0,0.5));
  }

  @keyframes mfFoilShift { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
  /* "FOIL" com o gradiente foil da logo (rosas → roxo → azul), shimmer contínuo */
  .mf-card-foil {
    background: linear-gradient(110deg, #B50D57 0%, #D7327F 6%, #F856A7 12%, #FC7DC0 19%, #FF9AD5 26%, #E3A9E9 33%, #C49AFF 40%, #AEADFF 45%, #9AC1FF 50%, #AEADFF 55%, #C49AFF 60%, #E3A9E9 67%, #FF9AD5 74%, #FC7DC0 81%, #F856A7 88%, #D7327F 94%, #B50D57 100%);
    background-size: 200% 200%;
    animation: mfFoilShift 7s linear infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: translateZ(0);
    filter:
      drop-shadow(0px 10px 22px rgba(0,0,0,0.8))
      drop-shadow(0px 3px 6px rgba(0,0,0,0.5));
  }

  .mf-depth-card {
    background: #020617;
    box-shadow:
      0 40px 100px -20px rgba(0,0,0,0.9),
      0 20px 40px -20px rgba(0,0,0,0.8),
      inset 0 1px 2px rgba(255,255,255,0.12),
      inset 0 -2px 4px rgba(0,0,0,0.8);
    border: 1px solid rgba(255,255,255,0.04);
    position: relative;
  }

  .mf-card-sheen {
    position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 50;
    background: radial-gradient(700px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(248,86,167,0.05) 0%, transparent 40%);
    mix-blend-mode: screen; transition: opacity 0.3s ease;
  }

  .mf-iphone-bezel {
    background-color: #111;
    box-shadow:
      inset 0 0 0 2px #52525B,
      inset 0 0 0 7px #000,
      0 40px 80px -15px rgba(0,0,0,0.9),
      0 15px 25px -5px rgba(0,0,0,0.7);
    transform-style: preserve-3d;
  }

  .mf-hardware-btn {
    background: linear-gradient(90deg, #404040 0%, #171717 100%);
    box-shadow: -2px 0 5px rgba(0,0,0,0.8), inset -1px 0 1px rgba(255,255,255,0.15), inset 1px 0 2px rgba(0,0,0,0.8);
    border-left: 1px solid rgba(255,255,255,0.05);
  }

  .mf-screen-glare {
    background: linear-gradient(110deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 45%);
  }

  .mf-widget-depth {
    background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
    box-shadow: 0 8px 16px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.04), inset 0 -1px 1px rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.03);
  }

  .mf-float-badge {
    /* Navy translúcido: mesmo tom, com transparência + blur de vidro */
    background: linear-gradient(135deg, rgba(13,18,34,0.6) 0%, rgba(2,6,23,0.42) 100%);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.1),
      0 20px 40px -10px rgba(0,0,0,0.8),
      inset 0 1px 1px rgba(255,255,255,0.18),
      inset 0 -1px 1px rgba(0,0,0,0.5);
  }

  .mf-chart-line {
    stroke-dasharray: 400;
    stroke-dashoffset: 400;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .mf-btn-light {
    background: linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%);
    color: #0F172A;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1), 0 12px 24px -4px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.05);
    transition: all 0.35s cubic-bezier(0.25,1,0.5,1);
  }
  .mf-btn-light:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 6px 12px -2px rgba(0,0,0,0.15), 0 20px 32px -6px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,1);
  }
  .mf-btn-light:active { transform: translateY(1px); background: linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 100%); }

  .mf-btn-dark {
    background: linear-gradient(180deg, #B50D57 0%, #7d0a3d 100%);
    color: #FFFFFF;
    box-shadow: 0 0 0 1px rgba(248,86,167,0.2), 0 2px 4px rgba(0,0,0,0.5), 0 12px 24px -4px rgba(181,13,87,0.4), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -3px 6px rgba(0,0,0,0.6);
    transition: all 0.35s cubic-bezier(0.25,1,0.5,1);
  }
  .mf-btn-dark:hover {
    transform: translateY(-3px);
    background: linear-gradient(180deg, #d4106a 0%, #B50D57 100%);
    box-shadow: 0 0 0 1px rgba(248,86,167,0.3), 0 6px 12px rgba(0,0,0,0.4), 0 20px 32px -6px rgba(181,13,87,0.6), inset 0 1px 1px rgba(255,255,255,0.25);
  }
  .mf-btn-dark:active { transform: translateY(1px); background: #7d0a3d; }
`;

// Fatias do print da dashboard: cada banda entra na animação como um
// widget (stagger); a banda do gráfico tem reveal próprio (wipe)
const PHONE_BANDS = [
  { top: 0, h: 13.1 }, // status + "Olá, Danilo"
  { top: 13.1, h: 13.1 }, // valor da coleção
  { top: 26.2, h: 16.9, chart: true }, // gráfico
  { top: 43.1, h: 9.4 }, // períodos + portfólios
  { top: 52.5, h: 11.9 }, // ações circulares
  { top: 64.4, h: 10.6 }, // aviso de preços
  { top: 75, h: 25 }, // Em Alta
];

export interface CinematicHeroProps
  extends React.HTMLAttributes<HTMLDivElement> {
  isDark?: boolean;
  tagline1?: string;
  tagline2?: string;
  cardHeading?: string;
  cardDescription?: React.ReactNode;
  // Badges das lojas renderizados abaixo da descrição do card (injetados
  // pela landing pra evitar import circular)
  storeBadges?: React.ReactNode;
  metricValue?: number;
  metricLabel?: string;
}

export function CinematicHero({
  isDark = false,
  tagline1 = "Saber o preço da sua carta",
  tagline2 = "ficou mais fácil.",
  cardHeading = "Coleção inteligente.",
  cardDescription = (
    <>
      O <span style={{ color: "#F856A7", fontWeight: 600 }}>Mint Foil</span>{" "}
      identifica suas cartas em segundos e mostra o valor de referência em
      reais, atualizado todos os dias — com link pra conferir nas lojas
      brasileiras.
    </>
  ),
  storeBadges,
  metricValue = 428,
  metricLabel = "Cartas",
  className,
  ...props
}: CinematicHeroProps) {
  const textColor = isDark ? "#FFFFFF" : "#020617";
  const sectionBg = isDark ? "#020617" : "#F6F6F6";
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 2) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!mainCardRef.current || !mockupRef.current) return;
        const rect = mainCardRef.current.getBoundingClientRect();
        mainCardRef.current.style.setProperty(
          "--mouse-x",
          `${e.clientX - rect.left}px`,
        );
        mainCardRef.current.style.setProperty(
          "--mouse-y",
          `${e.clientY - rect.top}px`,
        );
        const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
        const yVal = (e.clientY / window.innerHeight - 0.5) * 2;
        gsap.to(mockupRef.current, {
          rotationY: xVal * 10,
          rotationX: -yVal * 10,
          ease: "power3.out",
          duration: 1.2,
        });
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const ctx = gsap.context(() => {
      gsap.set(".mf-text-track", {
        autoAlpha: 0,
        y: 50,
        scale: 0.88,
        filter: "blur(16px)",
      });
      gsap.set(".mf-text-reveal", {
        autoAlpha: 1,
        clipPath: "inset(0 100% 0 0)",
      });
      gsap.set(".mf-main-card", { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set(
        [
          ".mf-card-left",
          ".mf-card-right",
          ".mf-mockup-wrap",
          ".mf-badge",
          ".mf-phone-widget",
        ],
        { autoAlpha: 0 },
      );
      gsap.set(".mf-chart-band", { clipPath: "inset(0 100% 0 0)" });

      const introTl = gsap.timeline({ delay: 0.2 });
      introTl
        .to(".mf-text-track", {
          duration: 1.6,
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          ease: "expo.out",
        })
        .to(
          ".mf-text-reveal",
          { duration: 1.3, clipPath: "inset(0 0% 0 0)", ease: "power4.inOut" },
          "-=0.9",
        );

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=5000",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      scrollTl
        .to(
          [".mf-hero-text", ".mf-bg-grid"],
          {
            scale: 1.12,
            filter: "blur(18px)",
            opacity: 0.15,
            ease: "power2.inOut",
            duration: 2,
          },
          0,
        )
        .to(".mf-main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
        .to(".mf-main-card", {
          width: "100%",
          height: "100%",
          borderRadius: "0px",
          ease: "power3.inOut",
          duration: 1.5,
        })
        .fromTo(
          ".mf-mockup-wrap",
          {
            y: 280,
            z: -400,
            rotationX: 45,
            rotationY: -25,
            autoAlpha: 0,
            scale: 0.65,
          },
          {
            y: 0,
            z: 0,
            rotationX: 0,
            rotationY: 0,
            autoAlpha: 1,
            scale: 1,
            ease: "expo.out",
            duration: 2.2,
          },
          "-=0.6",
        )
        .fromTo(
          ".mf-phone-widget",
          { y: 36, autoAlpha: 0, scale: 0.94 },
          {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            stagger: 0.12,
            ease: "back.out(1.2)",
            duration: 1.4,
          },
          "-=1.4",
        )
        .to(
          ".mf-chart-band",
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 2,
            ease: "power2.inOut",
          },
          "-=1.0",
        )
        .fromTo(
          ".mf-badge",
          { y: 80, autoAlpha: 0, scale: 0.75, rotationZ: -8 },
          {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            rotationZ: 0,
            ease: "back.out(1.4)",
            duration: 1.4,
            stagger: 0.18,
          },
          "-=1.8",
        )
        .fromTo(
          ".mf-card-left",
          { x: -44, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.4 },
          "-=1.4",
        )
        .fromTo(
          ".mf-card-right",
          { x: 44, autoAlpha: 0, scale: 0.85 },
          { x: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 1.4 },
          "<",
        )
        .to({}, { duration: 2.2 })
        .set(".mf-hero-text", { autoAlpha: 0 })
        .to(
          [".mf-mockup-wrap", ".mf-badge", ".mf-card-left", ".mf-card-right"],
          {
            scale: 0.92,
            y: -36,
            z: -180,
            autoAlpha: 0,
            ease: "power3.in",
            duration: 1.1,
            stagger: 0.04,
          },
        )
        .to(
          ".mf-main-card",
          {
            width: isMobile ? "92vw" : "82vw",
            height: isMobile ? "90vh" : "82vh",
            borderRadius: isMobile ? "28px" : "36px",
            ease: "expo.inOut",
            duration: 1.6,
          },
          "pb",
        )
        .to(".mf-main-card", {
          y: -window.innerHeight - 300,
          ease: "power3.in",
          duration: 1.4,
        })
        // Só DEPOIS que o card sumiu por completo: a tela (já vazia) esmaece
        // e revela a próxima seção, que espera atrás via margem negativa
        .to(containerRef.current, {
          autoAlpha: 0,
          ease: "power1.inOut",
          duration: 0.5,
        });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-screen h-screen overflow-hidden flex items-center justify-center antialiased",
        className,
      )}
      style={{
        perspective: "1500px",
        fontFamily: '"Circular Std", "DM Sans", system-ui, sans-serif',
        backgroundColor: sectionBg,
        color: textColor,
      }}
      {...props}
    >
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static CSS string, no user input */}
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div className="mf-film-grain" aria-hidden="true" />

      {/* Subtle grid */}
      <div
        className="mf-bg-grid absolute inset-0 z-0 pointer-events-none opacity-30"
        style={{
          backgroundSize: "60px 60px",
          backgroundImage:
            "linear-gradient(to right, rgba(2,6,23,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(2,6,23,0.06) 1px, transparent 1px)",
          maskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Hero text layer — mesma formatação exata dos taglines do hero:
          clamp(34px→96px), weight 700/800, tracking -0.025/-0.05em */}
      <div className="mf-hero-text absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4">
        <h1
          className="mf-text-track mf-gsap-reveal"
          style={{
            color: textColor,
            fontSize: "clamp(34px, 7.5vw, 96px)",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.025em",
            margin: 0,
          }}
        >
          {tagline1}
        </h1>
        <h1
          className={`mf-text-reveal mf-gsap-reveal${isDark ? " mf-text-silver" : ""}`}
          style={{
            ...(isDark ? {} : { color: textColor }),
            fontSize: "clamp(34px, 7.5vw, 96px)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.05em",
            margin: "8px 0 0",
          }}
        >
          {tagline2}
        </h1>
      </div>

      {/* Deep card layer */}
      <div
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
        style={{ perspective: "1500px" }}
      >
        <div
          ref={mainCardRef}
          className="mf-main-card mf-depth-card relative overflow-hidden flex items-center justify-center pointer-events-auto w-[92vw] md:w-[82vw] h-[88vh] md:h-[82vh] rounded-[28px] md:rounded-[36px]"
        >
          <div className="mf-card-sheen" aria-hidden="true" />

          <div className="relative w-full h-full max-w-7xl mx-auto px-4 lg:px-12 flex flex-col justify-evenly lg:grid lg:grid-cols-3 items-center lg:gap-8 z-10 py-6 lg:py-0">
            {/* Right / top-mobile: BRAND wordmark */}
            <div className="mf-card-right mf-gsap-reveal order-1 lg:order-3 flex justify-center lg:justify-end z-20 w-full">
              <h2 className="text-5xl md:text-[5.5rem] lg:text-[7rem] font-black uppercase tracking-tighter leading-none text-center lg:text-right">
                <span className="mf-card-silver">MINT</span>
                <br />
                <span className="mf-card-foil">FOIL</span>
              </h2>
            </div>

            {/* Center: iPhone mockup */}
            <div
              className="mf-mockup-wrap order-2 lg:order-2 relative w-full h-[360px] lg:h-[580px] flex items-center justify-center z-10"
              style={{ perspective: "1000px" }}
            >
              <div className="relative w-full h-full flex items-center justify-center transform scale-[0.65] md:scale-90 lg:scale-100">
                <div
                  ref={mockupRef}
                  className="relative w-[272px] h-[565px] rounded-[3rem] mf-iphone-bezel flex flex-col"
                  style={{
                    willChange: "transform",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Hardware buttons */}
                  <div
                    className="absolute top-[115px] -left-[3px] w-[3px] h-[22px] mf-hardware-btn rounded-l-md"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute top-[152px] -left-[3px] w-[3px] h-[42px] mf-hardware-btn rounded-l-md"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute top-[208px] -left-[3px] w-[3px] h-[42px] mf-hardware-btn rounded-l-md"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute top-[165px] -right-[3px] w-[3px] h-[65px] mf-hardware-btn rounded-r-md"
                    aria-hidden="true"
                    style={{ transform: "scaleX(-1)" }}
                  />

                  {/* Screen */}
                  <div
                    className="absolute inset-[7px] bg-[#050914] rounded-[2.4rem] overflow-hidden text-white z-10"
                    style={{ boxShadow: "inset 0 0 15px rgba(0,0,0,1)" }}
                  >
                    <div
                      className="absolute inset-0 mf-screen-glare z-40 pointer-events-none"
                      aria-hidden="true"
                    />

                    {/* Dynamic Island */}
                    <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[96px] h-[26px] bg-black rounded-full z-50 flex items-center justify-end px-3">
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"
                        style={{ boxShadow: "0 0 8px rgba(248,86,167,0.8)" }}
                      />
                    </div>

                    {/* App real fatiado: cada banda entra como um widget
                        (stagger um a um); o gráfico entra com wipe */}
                    <div className="relative h-full w-full">
                      {PHONE_BANDS.map((b) => (
                        <div
                          key={b.top}
                          className={
                            b.chart
                              ? "mf-chart-band absolute left-0 w-full overflow-hidden"
                              : "mf-phone-widget absolute left-0 w-full overflow-hidden"
                          }
                          style={{ top: `${b.top}%`, height: `${b.h}%` }}
                        >
                          {/* biome-ignore lint/performance/noImgElement: imagem local do mockup */}
                          <img
                            src="/landing/app-dashboard.jpg"
                            alt=""
                            className="absolute left-0 w-full object-cover"
                            style={{
                              top: `${(-b.top / b.h) * 100}%`,
                              height: `${(100 / b.h) * 100}%`,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="mf-badge absolute top-20 lg:top-32 left-[-10px] lg:left-[-72px] mf-float-badge rounded-xl lg:rounded-2xl p-3 lg:p-3.5 flex items-center gap-2.5 z-30">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0"
                    style={{
                      background: "rgba(248,86,167,0.15)",
                      borderColor: "rgba(248,86,167,0.25)",
                    }}
                  >
                    <span className="text-sm" aria-hidden="true">
                      ✦
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold tracking-tight">
                      Carta identificada
                    </p>
                    <p
                      className="text-[10px] font-medium"
                      style={{ color: "rgba(248,86,167,0.6)" }}
                    >
                      Pikachu VMAX · R$ 380
                    </p>
                  </div>
                </div>

                <div className="mf-badge absolute bottom-14 lg:bottom-20 right-[-10px] lg:right-[-72px] mf-float-badge rounded-xl lg:rounded-2xl p-3 lg:p-3.5 flex items-center gap-2.5 z-30">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0"
                    style={{
                      background: "rgba(16,185,129,0.15)",
                      borderColor: "rgba(16,185,129,0.25)",
                    }}
                  >
                    <span className="text-sm" aria-hidden="true">
                      ↑
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold tracking-tight">
                      Preço atualizado
                    </p>
                    <p className="text-[10px] font-medium text-emerald-400">
                      Liga Pokémon BR +23%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Left / bottom-mobile: description */}
            <div className="mf-card-left mf-gsap-reveal order-3 lg:order-1 flex flex-col justify-center text-center lg:text-left z-20 w-full px-3 lg:px-0">
              <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-0 lg:mb-4 tracking-tight">
                {cardHeading}
              </h3>
              <p
                className="hidden md:block text-sm md:text-base lg:text-lg font-normal leading-relaxed max-w-sm lg:max-w-none mx-auto lg:mx-0"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {cardDescription}
              </p>
              {storeBadges && (
                <div className="mt-9">
                  <p
                    className="mb-3 font-bold text-xs uppercase tracking-[0.22em]"
                    style={{ color: "#C49AFF" }}
                  >
                    Baixe agora — é grátis
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                    {storeBadges}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
