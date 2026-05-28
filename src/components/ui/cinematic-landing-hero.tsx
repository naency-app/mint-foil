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
    background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%);
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

export interface CinematicHeroProps
  extends React.HTMLAttributes<HTMLDivElement> {
  isDark?: boolean;
  tagline1?: string;
  tagline2?: string;
  cardHeading?: string;
  cardDescription?: React.ReactNode;
  metricValue?: number;
  metricLabel?: string;
  ctaHeading?: string;
  ctaDescription?: string;
}

export function CinematicHero({
  isDark = false,
  tagline1 = "Escaneie. Descubra.",
  tagline2 = "Saiba o valor real.",
  cardHeading = "Coleção inteligente.",
  cardDescription = (
    <>
      O <span style={{ color: "#F856A7", fontWeight: 600 }}>Mint Foil</span>{" "}
      identifica suas cartas em segundos e exibe o preço real das ligas e
      marketplaces brasileiros — tudo num só lugar.
    </>
  ),
  metricValue = 428,
  metricLabel = "Cartas",
  ctaHeading = "Comece a escanear.",
  ctaDescription = "Identifique suas cartas de Pokémon, Magic e Yu-Gi-Oh! e monitore o valor real do seu portfólio. Grátis para começar.",
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
      gsap.set(".mf-cta-wrap", {
        autoAlpha: 0,
        scale: 0.85,
        filter: "blur(24px)",
      });

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
          end: "+=6000",
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
          ".mf-chart-line",
          { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" },
          "-=1.2",
        )
        .to(
          ".mf-chart-area",
          { opacity: 1, duration: 1.8, ease: "power2.out" },
          "-=2.0",
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
        .set(".mf-cta-wrap", { autoAlpha: 1 })
        .to({}, { duration: 1.2 })
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
        .to(
          ".mf-cta-wrap",
          { scale: 1, filter: "blur(0px)", ease: "expo.inOut", duration: 1.6 },
          "pb",
        )
        .to(".mf-main-card", {
          y: -window.innerHeight - 300,
          ease: "power3.in",
          duration: 1.4,
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

      {/* Hero text layer */}
      <div className="mf-hero-text absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4">
        <h1
          className="mf-text-track mf-gsap-reveal text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tight mb-2"
          style={{ color: textColor }}
        >
          {tagline1}
        </h1>
        <h1
          className={`mf-text-reveal mf-gsap-reveal text-5xl md:text-7xl lg:text-[6rem] font-extrabold tracking-tighter${isDark ? " mf-text-silver" : ""}`}
          style={isDark ? undefined : { color: textColor, fontWeight: 800 }}
        >
          {tagline2}
        </h1>
      </div>

      {/* CTA layer */}
      <div className="mf-cta-wrap absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 pointer-events-auto">
        <h2
          className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-5 tracking-tight${isDark ? " mf-text-silver" : ""}`}
          style={isDark ? undefined : { color: textColor }}
        >
          {ctaHeading}
        </h2>
        <p
          className="text-base md:text-lg mb-10 max-w-md mx-auto font-normal leading-relaxed"
          style={{
            color: isDark ? "rgba(255,255,255,0.55)" : "rgba(2,6,23,0.55)",
          }}
        >
          {ctaDescription}
        </p>
        <div className="flex flex-col sm:flex-row gap-5">
          <a
            href="/#"
            aria-label="Download on the App Store"
            className="mf-btn-light flex items-center justify-center gap-3 px-7 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
          >
            <svg
              className="w-7 h-7"
              fill="currentColor"
              viewBox="0 0 384 512"
              aria-hidden="true"
            >
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-[-2px]">
                Download on the
              </div>
              <div className="text-lg font-bold leading-none tracking-tight">
                App Store
              </div>
            </div>
          </a>
          <a
            href="/#"
            aria-label="Get it on Google Play"
            className="mf-btn-dark flex items-center justify-center gap-3 px-7 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 512 512"
              aria-hidden="true"
            >
              <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] font-bold tracking-widest text-pink-200/60 uppercase mb-[-2px]">
                Get it on
              </div>
              <div className="text-lg font-bold leading-none tracking-tight">
                Google Play
              </div>
            </div>
          </a>
        </div>
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
              <h2 className="text-5xl md:text-[5.5rem] lg:text-[7rem] font-black uppercase tracking-tighter mf-card-silver leading-none text-center lg:text-right">
                MINT
                <br />
                FOIL
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

                    {/* App UI */}
                    <div className="relative w-full h-full pt-11 px-4 pb-7 flex flex-col">
                      {/* Header */}
                      <div className="mf-phone-widget flex justify-between items-center mb-6">
                        <div>
                          <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold block mb-0.5">
                            Portfólio
                          </span>
                          <span className="text-lg font-bold text-white">
                            Minha Coleção
                          </span>
                        </div>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-white/10"
                          style={{
                            background: "rgba(248,86,167,0.15)",
                            color: "#F856A7",
                          }}
                        >
                          IS
                        </div>
                      </div>

                      {/* Stock-style chart */}
                      <div className="mf-phone-widget mf-widget-depth rounded-2xl px-3 pt-3 pb-2 mb-4">
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">
                            Portfólio
                          </span>
                          <span
                            className="text-[10px] font-bold"
                            style={{ color: "#10B981" }}
                          >
                            +23,4%
                          </span>
                        </div>
                        <svg
                          viewBox="0 0 180 90"
                          className="w-full"
                          preserveAspectRatio="none"
                          style={{ height: 88 }}
                          role="img"
                          aria-label="Gráfico de valorização do portfólio"
                        >
                          <defs>
                            <linearGradient
                              id="mf-chart-fill"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#F856A7"
                                stopOpacity="0.25"
                              />
                              <stop
                                offset="100%"
                                stopColor="#F856A7"
                                stopOpacity="0"
                              />
                            </linearGradient>
                          </defs>
                          {/* Area fill */}
                          <path
                            className="mf-chart-area"
                            d="M0 68 L18 60 L36 72 L54 48 L72 54 L90 33 L108 42 L126 27 L144 36 L162 15 L180 21 L180 90 L0 90 Z"
                            fill="url(#mf-chart-fill)"
                            style={{ opacity: 0 }}
                          />
                          {/* Line */}
                          <path
                            className="mf-chart-line"
                            d="M0 68 L18 60 L36 72 L54 48 L72 54 L90 33 L108 42 L126 27 L144 36 L162 15 L180 21"
                            fill="none"
                            stroke="#F856A7"
                            strokeWidth="2"
                          />
                          {/* Last point dot */}
                          <circle cx="180" cy="21" r="3" fill="#F856A7" />
                        </svg>
                        <div className="flex justify-between mt-1">
                          <span className="text-[8px] text-white/25">30d</span>
                          <span className="text-[8px] text-white/25">Hoje</span>
                        </div>
                      </div>

                      {/* Widgets */}
                      <div className="space-y-2.5">
                        <div className="mf-phone-widget mf-widget-depth rounded-2xl p-3 flex items-center">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center mr-3 border flex-shrink-0"
                            style={{
                              background: "rgba(248,86,167,0.12)",
                              borderColor: "rgba(248,86,167,0.2)",
                            }}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="#F856A7"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-semibold text-white/80 truncate">
                              Charizard ex · SV3
                            </div>
                            <div
                              className="text-[9px] font-bold mt-0.5"
                              style={{ color: "#F856A7" }}
                            >
                              R$ 850,00
                            </div>
                          </div>
                        </div>
                        <div className="mf-phone-widget mf-widget-depth rounded-2xl p-3 flex items-center">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center mr-3 border flex-shrink-0"
                            style={{
                              background: "rgba(16,185,129,0.12)",
                              borderColor: "rgba(16,185,129,0.2)",
                            }}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="#10B981"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-semibold text-white/80 truncate">
                              Portfólio este mês
                            </div>
                            <div className="text-[9px] font-bold mt-0.5 text-emerald-400">
                              +R$ 1.240,00
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[110px] h-[3.5px] rounded-full"
                        style={{ background: "rgba(255,255,255,0.18)" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="mf-badge absolute top-8 lg:top-14 left-[-10px] lg:left-[-72px] mf-float-badge rounded-xl lg:rounded-2xl p-3 lg:p-3.5 flex items-center gap-2.5 z-30">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
