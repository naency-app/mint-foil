"use client";

import gsap from "gsap";
import {
  ArrowRight,
  BarChart3,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  DollarSign,
  Gamepad2,
  Globe,
  Heart,
  LayoutDashboard,
  Play,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Star,
  Store,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";

// ── Color tokens ──────────────────────────────────────────────────────────────

const PINK = "#F856A7";
const GRAD = "linear-gradient(135deg, #F856A7 0%, #B50D57 100%)";
const DARK = "#020617";
const TEXT_BODY = "#4a4a68";
const MUTED = "rgba(0,0,0,0.45)";
const BORDER = "rgba(0,0,0,0.08)";
const PINK_BORDER = "rgba(248,86,167,0.2)";
const PINK_BG = "rgba(248,86,167,0.06)";
const BG_ALT = "#F8F9FC";
const WHITE = "#FFFFFF";

// ── Motion variants ───────────────────────────────────────────────────────────

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: "easeOut" as const },
  },
};

// ── Responsive hook ──────────────────────────────────────────────────────────

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

// ── Partner / integration logos ───────────────────────────────────────────────

const LEAGUE_LOGOS_SHARED = [
  { id: "liga-pokemon", name: "Liga Pokémon", logo: "/logos/sites/logo_ligapokemon.png" },
  { id: "liga-magic", name: "Liga Magic", logo: "/logos/sites/logo-ligamagic.png" },
  { id: "liga-yugioh", name: "Liga Yu-Gi-Oh!", logo: "/logos/sites/logo_ligayugioh.png" },
  { id: "liga-onepiece", name: "Liga One Piece", logo: "/logos/sites/logo_ligaonepiece.png" },
  { id: "myp", name: "myP Cards", logo: "/logos/sites/logo-mypcards.png" },
];

// ── Full 30-card marquee (mixed TCGs — no repeats) ────────────────────────────

const ALL_MARQUEE_CARDS = [
  // Pokémon (12)
  "https://images.pokemontcg.io/swsh7/215_hires.png",
  "https://images.pokemontcg.io/sv3/234_hires.png",
  "https://images.pokemontcg.io/swsh4/188_hires.png",
  "https://images.pokemontcg.io/swsh8/271_hires.png",
  "https://images.pokemontcg.io/swsh7/218_hires.png",
  "https://images.pokemontcg.io/pgo/31_hires.png",
  "https://images.pokemontcg.io/swsh11/131_hires.png",
  "https://images.pokemontcg.io/swsh8/270_hires.png",
  "https://images.pokemontcg.io/swsh7/212_hires.png",
  "https://images.pokemontcg.io/swsh45sv/SV107_hires.png",
  "https://images.pokemontcg.io/swsh8/269_hires.png",
  "https://images.pokemontcg.io/swsh7/205_hires.png",
  // Yu-Gi-Oh! (8)
  "https://images.ygoprodeck.com/images/cards/89631139.jpg",
  "https://images.ygoprodeck.com/images/cards/46986414.jpg",
  "https://images.ygoprodeck.com/images/cards/33396948.jpg",
  "https://images.ygoprodeck.com/images/cards/74677422.jpg",
  "https://images.ygoprodeck.com/images/cards/38033121.jpg",
  "https://images.ygoprodeck.com/images/cards/44508094.jpg",
  "https://images.ygoprodeck.com/images/cards/23995346.jpg",
  "https://images.ygoprodeck.com/images/cards/61854111.jpg",
  // Magic (5)
  "https://cards.scryfall.io/large/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7571.jpg",
  "https://cards.scryfall.io/large/front/4/c/4cbc6901-6a4a-4d0a-83ea-7eefa3b35021.jpg",
  "https://cards.scryfall.io/large/front/e/3/e3285e6b-3e79-4d7c-bf96-d920f973b122.jpg",
  "https://cards.scryfall.io/large/front/c/8/c8817585-0d32-4d56-9142-0d29512e86a9.jpg",
  "https://cards.scryfall.io/large/front/e/6/e653437e-2e56-4443-aec5-5bb7d8860238.jpg",
  // One Piece placeholders (5)
  "https://images.pokemontcg.io/sv3pt5/230_hires.png",
  "https://images.pokemontcg.io/sv4pt5/234_hires.png",
  "https://images.pokemontcg.io/swsh12pt5/160_hires.png",
  "https://images.pokemontcg.io/swsh9/166_hires.png",
  "https://images.pokemontcg.io/swsh12pt5/GG70_hires.png",
];

// Triple the array for a seamless CSS marquee loop, stable IDs
const DUPED_MARQUEE = ["a", "b", "c"].flatMap((prefix) =>
  ALL_MARQUEE_CARDS.map((src, n) => ({
    src,
    id: `${prefix}${n}`,
    rot: n % 2 === 0 ? 8 : -8,
  })),
);

// Footer marquee — doubled for seamless loop
const FOOTER_MARQUEE_ITEMS = [
  "Scan Inteligente",
  "✦",
  "Preços Brasileiros",
  "✦",
  "Portfólio Completo",
  "✦",
  "Multi-TCG",
  "✦",
  "App + Web",
  "✦",
].flatMap((text, i) => [
  { text, id: `fa${i}` },
  { text, id: `fb${i}` },
]);

// Card back URLs per TCG
const BACKS = {
  pokemon:
    "https://limitlesstcg.nyc3.digitaloceanspaces.com/tpci/XY_EN_card_back.jpg",
  yugioh: "https://images.ygoprodeck.com/images/cards/back.jpg",
  magic:
    "https://limitlesstcg.nyc3.digitaloceanspaces.com/tpci/XY_EN_card_back.jpg",
  onepiece:
    "https://limitlesstcg.nyc3.digitaloceanspaces.com/opcg/OP_EN_card_back.jpg",
  dragonball: "https://images.ygoprodeck.com/images/cards/back.jpg",
  digimon:
    "https://limitlesstcg.nyc3.digitaloceanspaces.com/dcg/DCG_EN_card_back.jpg",
};

// Reveal section — 6 TCGs
// imgs[0] = card back (shown rotated behind) | imgs[1] = full-art front (shown on top)
const REVEAL_ITEMS = [
  {
    text: "Pokémon",
    imgs: [
      BACKS.pokemon,
      "https://images.pokemontcg.io/swsh7/215_hires.png",
    ],
  },
  {
    text: "Yu-Gi-Oh!",
    imgs: [
      BACKS.yugioh,
      "https://images.ygoprodeck.com/images/cards/89631139.jpg",
    ],
  },
  {
    text: "Magic",
    imgs: [
      BACKS.magic,
      "https://cards.scryfall.io/large/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7571.jpg",
    ],
  },
  {
    text: "One Piece",
    imgs: [
      BACKS.onepiece,
      "https://images.pokemontcg.io/sv3pt5/230_hires.png",
    ],
  },
  {
    text: "Dragon Ball",
    imgs: [
      BACKS.dragonball,
      "https://images.ygoprodeck.com/images/cards/44508094.jpg",
    ],
  },
  {
    text: "Digimon",
    imgs: [
      BACKS.digimon,
      "https://images.pokemontcg.io/swsh8/271_hires.png",
    ],
  },
];

// ── Primitives ────────────────────────────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.52, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function GradBtn({
  children,
  ghost = false,
  full = false,
  small = false,
  light = false,
  onClick,
}: {
  children: React.ReactNode;
  ghost?: boolean;
  full?: boolean;
  small?: boolean;
  light?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: small ? "10px 24px" : "14px 32px",
        borderRadius: "10px",
        border: ghost
          ? `1px solid ${light ? "rgba(255,255,255,0.3)" : PINK_BORDER}`
          : "none",
        background: ghost ? "transparent" : GRAD,
        color: WHITE,
        fontSize: small ? "13px" : "14px",
        fontWeight: 600,
        cursor: "pointer",
        width: full ? "100%" : "auto",
        transition: "opacity 0.2s ease",
        letterSpacing: "0.2px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.82";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
}

function PinkBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="outline"
      className="rounded-full border px-3.5 py-1 text-xs font-semibold uppercase tracking-widest"
      style={{
        background: PINK_BG,
        color: PINK,
        borderColor: PINK_BORDER,
      }}
    >
      {children}
    </Badge>
  );
}

function PhoneMockup({ children }: { children?: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        width: "290px",
        flexShrink: 0,
        background: "#1c1c1e",
        borderRadius: "52px",
        padding: "13px",
        boxShadow:
          "0 40px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 0 2px rgba(0,0,0,0.35)",
      }}
    >
      {/* Dynamic island */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "82px",
          height: "26px",
          borderRadius: "20px",
          background: "#000",
          zIndex: 5,
        }}
      />
      {/* Volume buttons (left) */}
      {[68, 108].map((top) => (
        <div
          key={top}
          style={{
            position: "absolute",
            left: "-3px",
            top: `${top}px`,
            width: "3px",
            height: "30px",
            background: "#3a3a3c",
            borderRadius: "2px 0 0 2px",
          }}
        />
      ))}
      {/* Power button (right) */}
      <div
        style={{
          position: "absolute",
          right: "-3px",
          top: "96px",
          width: "3px",
          height: "60px",
          background: "#3a3a3c",
          borderRadius: "0 2px 2px 0",
        }}
      />
      {/* Screen */}
      <div
        style={{
          borderRadius: "40px",
          overflow: "hidden",
          background: WHITE,
          aspectRatio: "9/19.5",
        }}
      >
        {children ?? (
          <div className="flex flex-col items-center gap-2 p-5" style={{ paddingTop: "56px" }}>
            <ScanLine size={28} color={PINK} />
            <p style={{ fontSize: "11px", color: MUTED }}>
              Screenshot real aqui
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function STitle({
  badge,
  title,
  sub,
}: {
  badge?: string;
  title: string;
  sub?: string;
}) {
  return (
    <div style={{ textAlign: "left", marginBottom: "48px" }}>
      {badge && (
        <FadeIn>
          <p
            style={{
              fontSize: "18px",
              lineHeight: "20px",
              fontWeight: 500,
              color: PINK,
              letterSpacing: "0.5px",
              margin: "0 0 12px",
            }}
          >
            {badge}
          </p>
        </FadeIn>
      )}
      <FadeIn delay={0.1}>
        <h2
          style={{
            fontSize: "clamp(24px, 4vw, 34px)",
            lineHeight: "clamp(32px, 5.5vw, 44px)",
            fontWeight: 700,
            color: DARK,
            margin: 0,
            maxWidth: "640px",
          }}
        >
          {title}
        </h2>
      </FadeIn>
      {sub && (
        <FadeIn delay={0.18}>
          <p
            style={{
              fontSize: "clamp(15px, 2.5vw, 18px)",
              lineHeight: "28px",
              color: MUTED,
              maxWidth: "520px",
              margin: "14px 0 0",
            }}
          >
            {sub}
          </p>
        </FadeIn>
      )}
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Coleções", href: "#colecoes" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Planos", href: "#planos" },
  { label: "FAQ", href: "#faq" },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: "60px",
        padding: isMobile ? "0 16px" : "0 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: scrolled ? "rgba(255,255,255,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? `1px solid rgba(0,0,0,0.06)`
          : "1px solid transparent",
        boxShadow: scrolled
          ? "0 1px 0 rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.04)"
          : "none",
        transition:
          "background 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease",
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "8px",
            background: GRAD,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "15px",
            fontWeight: 800,
            color: WHITE,
            letterSpacing: "-0.5px",
          }}
        >
          M
        </div>
        <span
          style={{ fontSize: "15px", fontWeight: 700, color: DARK, letterSpacing: "-0.2px" }}
        >
          Mint Foil
        </span>
      </div>

      {/* ── Center nav links — desktop only ── */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "2px",
        }}
        className="hidden md:flex"
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "rgba(2,6,23,0.55)",
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              transition: "color 0.18s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = DARK;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(2,6,23,0.55)";
            }}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* ── Right CTAs ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        {/* Ghost — Entrar (hidden on mobile) */}
        <button
          type="button"
          className="hidden md:inline-flex"
          style={{
            padding: "9px 18px",
            borderRadius: "8px",
            border: `1px solid rgba(2,6,23,0.12)`,
            background: "transparent",
            color: TEXT_BODY,
            fontSize: "13.5px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "border-color 0.18s, color 0.18s",
            letterSpacing: "-0.1px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(2,6,23,0.28)";
            e.currentTarget.style.color = DARK;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(2,6,23,0.12)";
            e.currentTarget.style.color = TEXT_BODY;
          }}
        >
          Entrar
        </button>

        {/* Primary — Baixar Grátis (dark filled, like tryoption "Try Olwen") */}
        <button
          type="button"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 18px",
            borderRadius: "8px",
            border: "none",
            background: DARK,
            color: WHITE,
            fontSize: "13.5px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "opacity 0.18s",
            letterSpacing: "-0.1px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          Baixar Grátis
          <ArrowRight size={13} />
        </button>
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  const isMobile = useIsMobile();
  return (
    <section
      style={{
        position: "relative",
        minHeight: isMobile ? "auto" : "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: isMobile ? "96px" : "120px",
        paddingBottom: isMobile ? "60px" : "0",
        overflow: "hidden",
        background: WHITE,
      }}
    >
      {/* Spotlight radial gradient behind headline */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "560px",
          background:
            "radial-gradient(ellipse at center, rgba(248,86,167,0.07) 0%, transparent 68%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Headline + CTAs — framer stagger */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        style={{
          maxWidth: "760px",
          textAlign: "center",
          position: "relative",
          zIndex: 10,
          padding: "0 24px",
        }}
      >
        <motion.div variants={fadeItem}>
          <PinkBadge>Lançamento 2025</PinkBadge>
        </motion.div>

        <motion.h1
          variants={fadeItem}
          style={{
            fontSize: isMobile ? "36px" : "60px",
            lineHeight: isMobile ? "46px" : "75px",
            fontWeight: 700,
            color: DARK,
            margin: "20px 0 0",
            letterSpacing: "-0.5px",
          }}
        >
          Você tem centenas de cartas e{" "}
          <span
            style={{
              background: GRAD,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            não sabe quanto valem.
          </span>
          <br />
          Agora vai saber.
        </motion.h1>

        <motion.p
          variants={fadeItem}
          style={{
            fontSize: isMobile ? "15px" : "18px",
            lineHeight: isMobile ? "24px" : "28px",
            color: MUTED,
            maxWidth: "580px",
            margin: "20px auto 0",
          }}
        >
          {"Escaneie suas cartas de "}
          {(["Pokémon", "Magic", "Yu-Gi-Oh!", "One Piece"] as string[]).map(
            (name, i, arr) => (
              <span key={name}>
                <strong style={{ fontWeight: 700, color: DARK }}>{name}</strong>
                {i < arr.length - 2 ? ", " : i === arr.length - 2 ? " e " : ""}
              </span>
            ),
          )}
          {". Organize num portfólio. Monitore o preço real das ligas brasileiras. No celular ou na web."}
        </motion.p>

        <motion.div variants={fadeItem}>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              marginTop: "32px",
              flexWrap: "wrap",
            }}
          >
            <GradBtn>
              <ArrowRight size={16} /> Baixar Grátis
            </GradBtn>
            <GradBtn ghost>
              <Play size={14} /> Ver como funciona
            </GradBtn>
          </div>
          <p style={{ fontSize: "12px", color: MUTED, marginTop: "12px" }}>
            30 scans grátis por dia · Sem criar conta · Sem cartão
          </p>
        </motion.div>

        <motion.div
          variants={fadeItem}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            justifyContent: "center",
            marginTop: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "2px" }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={13} fill={PINK} color={PINK} />
            ))}
          </div>
          <span style={{ fontSize: "12px", color: MUTED }}>
            Em breve na App Store e Google Play
          </span>
        </motion.div>
      </motion.div>

      {/* Card marquee strip — CSS animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.6 }}
        style={{
          position: "absolute",
          bottom: "30px",
          left: 0,
          width: "100%",
          height: "30%",
          maskImage:
            "linear-gradient(to bottom, transparent, black 25%, black 70%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 25%, black 70%, transparent)",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "16px",
            animation: "marquee 55s linear infinite",
            width: "max-content",
          }}
        >
          {DUPED_MARQUEE.map(({ src, id, rot }) => (
            <div
              key={id}
              style={{
                height: "180px",
                aspectRatio: "3/4.2",
                flexShrink: 0,
                transform: `rotate(${rot}deg)`,
              }}
            >
              {/* biome-ignore lint/performance/noImgElement: external TCG card URLs require referrerPolicy */}
              <img
                src={src}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: "10px",
                  filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.15))",
                }}
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ── Video ─────────────────────────────────────────────────────────────────────

function VideoSection() {
  const isMobile = useIsMobile();
  return (
    <section style={{ background: BG_ALT, padding: isMobile ? "60px 0" : "80px 0" }}>
      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: isMobile ? "0 20px" : "0 24px" }}>
        <STitle
          badge="Veja em ação"
          title="Conheça a interface do Mint Foil"
          sub="Navegue pela versão web e veja como funciona na prática."
        />
        <FadeIn>
          <div
            style={{
              width: "100%",
              borderRadius: "20px",
              overflow: "hidden",
              background: WHITE,
              border: `1px solid ${BORDER}`,
              aspectRatio: "1024 / 534.945",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: GRAD,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Play size={28} color={WHITE} fill={WHITE} />
              </div>
              <p style={{ fontSize: "14px", color: MUTED }}>
                Clique para assistir o vídeo
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "rgba(0,0,0,0.2)",
                  marginTop: "8px",
                }}
              >
                Substitua por embed do YouTube/Vimeo
              </p>
            </div>
          </div>
        </FadeIn>

        {/* ── "Monitoring across" strip ── */}
        <div
          style={{
            marginTop: "40px",
            paddingTop: "32px",
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "rgba(0,0,0,0.3)",
              marginBottom: "20px",
              letterSpacing: "0.2px",
            }}
          >
            Preços em tempo real de:
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "40px",
              flexWrap: "wrap",
            }}
          >
            {LEAGUE_LOGOS_SHARED.map((l) => (
              // biome-ignore lint/performance/noImgElement: partner logo
              <img
                key={l.id}
                src={l.logo}
                alt={l.name}
                style={{
                  height: "22px",
                  maxWidth: "100px",
                  objectFit: "contain",
                  filter: "grayscale(1) opacity(0.4)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Reveal hover ──────────────────────────────────────────────────────────────

function RevealItem({ text, imgs }: { text: string; imgs: string[] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ position: "relative", padding: "16px 0", overflow: "visible" }}
    >
      <button
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "default",
          textAlign: "left",
          width: "100%",
        }}
      >
        <h3
          style={{
            fontSize: "clamp(52px, 9.5vw, 96px)",
            fontWeight: 900,
            fontFamily: "var(--font-heading)",
            color: DARK,
            textTransform: "uppercase",
            lineHeight: 1,
            transition: "opacity 0.4s",
            opacity: hovered ? 0.2 : 1,
            letterSpacing: "-1px",
          }}
        >
          {text}
        </h3>
      </button>

      {/* Card 1 (front) */}
      <div
        style={{
          position: "absolute",
          right: "40px",
          top: "-10px",
          zIndex: 40,
          width: "100px",
          height: "140px",
          transform: hovered ? "scale(1)" : "scale(0)",
          opacity: hovered ? 1 : 0,
          transition: "all 0.45s cubic-bezier(0.34,1.56,0.64,1)",
          pointerEvents: "none",
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: external TCG card URLs require referrerPolicy */}
        <img
          src={imgs[1]}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: "8px",
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.2))",
          }}
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Card 2 (behind, rotated) */}
      <div
        style={{
          position: "absolute",
          right: "40px",
          top: "-10px",
          zIndex: 39,
          width: "100px",
          height: "140px",
          transform: hovered
            ? "scale(1) translateX(55px) translateY(30px) rotate(12deg)"
            : "scale(0)",
          opacity: hovered ? 1 : 0,
          transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.08s",
          pointerEvents: "none",
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: external TCG card URLs require referrerPolicy */}
        <img
          src={imgs[0]}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: "8px",
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.2))",
          }}
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}

function RevealSection() {
  const isMobile = useIsMobile();
  return (
    <section
      id="colecoes"
      style={{ padding: isMobile ? "80px 20px" : "125px 24px", maxWidth: "1240px", margin: "0 auto" }}
    >
      <STitle badge="Coleções" title="Explore seus jogos favoritos" />
      {REVEAL_ITEMS.map(({ text, imgs }) => (
        <RevealItem key={text} text={text} imgs={imgs} />
      ))}
    </section>
  );
}

// ── Pain ──────────────────────────────────────────────────────────────────────

const PAINS = [
  {
    id: "valor",
    icon: <ScanLine size={22} />,
    title: "Não sabe o valor",
    desc: "Cartas que podem valer R$ 5 ou R$ 500. Você não sabe qual é qual.",
  },
  {
    id: "horas",
    icon: <TrendingUp size={22} />,
    title: "Perde horas pesquisando",
    desc: "Abre a liga, pesquisa carta por carta. Consultou 10, cansou. Faltam 300.",
  },
  {
    id: "gringo",
    icon: <Globe size={22} />,
    title: "App gringo, preço errado",
    desc: "Converte dólar pra real. O preço não tem nada a ver com o mercado BR.",
  },
  {
    id: "barato",
    icon: <DollarSign size={22} />,
    title: "Já vendeu barato",
    desc: "Vendeu carta por um valor que depois descobriu que estava errado.",
  },
  {
    id: "catalogo",
    icon: <LayoutDashboard size={22} />,
    title: "Coleção sem catálogo",
    desc: "Caixas cheias de cartas nunca catalogadas. Pode ter fortuna ali.",
  },
  {
    id: "jogos",
    icon: <Gamepad2 size={22} />,
    title: "4 jogos, 4 problemas",
    desc: "Pokémon, Magic, Yu-Gi-Oh!, One Piece. Precisaria de 4 sites.",
  },
];

function Pain() {
  const isMobile = useIsMobile();
  return (
    <section style={{ background: BG_ALT, padding: isMobile ? "80px 20px" : "125px 24px" }}>
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        <STitle
          badge="O Problema"
          title="Colecionar é fácil. Saber o valor real, não."
          sub="Se coleciona cards de mais de um jogo, já sentiu pelo menos três dessas:"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {PAINS.map((p, i) => (
            <FadeIn key={p.id} delay={i * 0.07}>
              {/* biome-ignore lint/a11y/noStaticElementInteractions: decorative border hover, not a clickable action */}
              <div
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "14px",
                  padding: "24px",
                  height: "100%",
                  transition: "border-color 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(248,86,167,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = BORDER;
                }}
              >
                <div style={{ color: PINK, marginBottom: "12px" }}>
                  {p.icon}
                </div>
                <h4
                  style={{
                    fontSize: "20px",
                    lineHeight: "28px",
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: "6px",
                  }}
                >
                  {p.title}
                </h4>
                <p
                  style={{
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: MUTED,
                    margin: 0,
                  }}
                >
                  {p.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Solution ──────────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: "scan",
    icon: <Camera size={20} />,
    title: "Escaneie",
    desc: "Aponte a câmera. O Mint Foil reconhece nome, edição, raridade e jogo.",
  },
  {
    id: "preco",
    icon: <DollarSign size={20} />,
    title: "Veja o preço real",
    desc: "Preço das ligas brasileiras na hora. Não conversão de dólar.",
  },
  {
    id: "organize",
    icon: <BarChart3 size={20} />,
    title: "Organize e monitore",
    desc: "A carta entra no portfólio. Acompanhe valorização com gráficos.",
  },
];

function Solution() {
  const isMobile = useIsMobile();
  return (
    <section
      id="como-funciona"
      style={{ padding: isMobile ? "80px 20px" : "125px 24px" }}
    >
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
      {/* ── Header row: badge + title left / Watch Demo right ── */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "flex-end",
          marginBottom: "48px",
          gap: isMobile ? "16px" : "24px",
        }}
      >
        <div>
          <FadeIn>
            <p
              style={{
                fontSize: "18px",
                lineHeight: "20px",
                fontWeight: 500,
                color: PINK,
                letterSpacing: "0.5px",
                margin: "0 0 12px",
              }}
            >
              A Solução
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2
              style={{
                fontSize: "34px",
                lineHeight: "44px",
                fontWeight: 700,
                color: DARK,
                margin: 0,
                maxWidth: "480px",
              }}
            >
              3 passos. Toda a coleção sob controle.
            </h2>
          </FadeIn>
        </div>

        {/* Watch Demo — top right, igual tryoption */}
        <FadeIn delay={0.12}>
          <button
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "11px 20px",
              borderRadius: "8px",
              border: `1px solid rgba(2,6,23,0.12)`,
              background: DARK,
              color: WHITE,
              fontSize: "13.5px",
              fontWeight: 600,
              cursor: "pointer",
              flexShrink: 0,
              transition: "opacity 0.18s",
              letterSpacing: "-0.1px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.82";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Play size={9} color={WHITE} fill={WHITE} />
            </div>
            Watch Demo
          </button>
        </FadeIn>
      </div>

      {/* ── 3 cards lado a lado — layout tryoption ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        {STEPS.map((s, i) => (
          <FadeIn key={s.id} delay={i * 0.1}>
            <div
              style={{
                position: "relative",
                padding: "28px 24px",
                borderRadius: "14px",
                background: WHITE,
                border: `1px solid ${BORDER}`,
                height: "100%",
              }}
            >
              {/* Step number — top right, cinza bem sutil */}
              <span
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "22px",
                  fontSize: "32px",
                  fontWeight: 800,
                  lineHeight: 1,
                  color: "rgba(0,0,0,0.06)",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              >
                #{i + 1}
              </span>

              {/* Icon */}
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: PINK_BG,
                  border: `1px solid ${PINK_BORDER}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: PINK,
                  marginBottom: "20px",
                }}
              >
                {s.icon}
              </div>

              <h4
                style={{
                  fontSize: "20px",
                  lineHeight: "28px",
                  fontWeight: 500,
                  color: "#374151",
                  margin: "0 0 8px",
                  paddingRight: "32px",
                }}
              >
                {s.title}
              </h4>
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: "24px",
                  color: MUTED,
                  margin: 0,
                }}
              >
                {s.desc}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
      </div>
    </section>
  );
}

// ── Benefits Tabs ─────────────────────────────────────────────────────────────

const BENEFIT_TABS = [
  {
    value: "colecionadores",
    label: "Colecionadores",
    icon: <Users size={15} />,
    title: "Descubra o valor real!",
    points: [
      {
        id: "scan",
        icon: <Camera size={18} />,
        title: "Scan instantâneo",
        desc: "Aponte, escaneie, veja o preço. Segundos.",
      },
      {
        id: "valorizacao",
        icon: <TrendingUp size={18} />,
        title: "Monitore valorização",
        desc: "Gráficos de preço. Saiba quando vender.",
      },
      {
        id: "tesouros",
        icon: <Star size={18} />,
        title: "Tesouros escondidos",
        desc: "Carta de R$ 10 pode valer R$ 300.",
      },
    ],
    mockupIcon: <ScanLine size={28} />,
  },
  {
    value: "lojistas",
    label: "Lojistas",
    icon: <Store size={15} />,
    title: "Cataloga em escala!",
    points: [
      {
        id: "volume",
        icon: <Zap size={18} />,
        title: "Volume rápido",
        desc: "Pack aberto → scan em sequência → catalogado.",
      },
      {
        id: "preco",
        icon: <DollarSign size={18} />,
        title: "Preço BR real",
        desc: "Preços das ligas brasileiras direto.",
      },
      {
        id: "estoque",
        icon: <LayoutDashboard size={18} />,
        title: "Estoque digital",
        desc: "Portfólio = controle de inventário.",
      },
    ],
    mockupIcon: <Store size={28} />,
  },
  {
    value: "jogadores",
    label: "Jogadores",
    icon: <Gamepad2 size={15} />,
    title: "Deck inteligente!",
    points: [
      {
        id: "troca",
        icon: <ShieldCheck size={18} />,
        title: "Valor antes da troca",
        desc: "Confira preço real antes de trocar.",
      },
      {
        id: "app",
        icon: <Gamepad2 size={18} />,
        title: "Tudo num app",
        desc: "Pokémon, Magic, Yu-Gi-Oh!, One Piece.",
      },
      {
        id: "torneio",
        icon: <Smartphone size={18} />,
        title: "Leve pra torneio",
        desc: "Portfólio no celular, sempre.",
      },
    ],
    mockupIcon: <Gamepad2 size={28} />,
  },
];

function BenefitsTabs() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const isMobile = useIsMobile();
  const t = BENEFIT_TABS[activeIdx];

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () => setActiveIdx((i) => (i + 1) % BENEFIT_TABS.length),
      CAROUSEL_INTERVAL
    );
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <section
      style={{ background: BG_ALT, padding: isMobile ? "80px 20px" : "125px 24px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        <FadeIn>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: isMobile ? "0" : "96px",
              alignItems: "start",
            }}
          >
            {/* ── LEFT: title + tab rows ── */}
            <div>
              <STitle badge="Benefícios" title="O Mint Foil se adapta a você" />
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                {BENEFIT_TABS.map((tab, i) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    style={{
                      position: "relative",
                      textAlign: "left",
                      padding: "18px 20px",
                      borderRadius: "12px",
                      border: "none",
                      background: activeIdx === i ? PINK_BG : "transparent",
                      cursor: "pointer",
                      overflow: "hidden",
                      transition: "background 0.25s",
                      width: "100%",
                    }}
                  >
                    {/* Left accent bar */}
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "3px",
                        borderRadius: "0 2px 2px 0",
                        background: activeIdx === i ? GRAD : "transparent",
                        transition: "background 0.25s",
                      }}
                    />
                    {/* Progress bar */}
                    {activeIdx === i && !paused && (
                      <span
                        key={`${tab.value}-prog`}
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          height: "2px",
                          background: GRAD,
                          borderRadius: "0 2px 2px 0",
                          animation: `featureProgress ${CAROUSEL_INTERVAL}ms linear forwards`,
                        }}
                      />
                    )}
                    <div
                      style={{
                        display: "flex",
                        gap: "14px",
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          color: activeIdx === i ? PINK : MUTED,
                          marginTop: "2px",
                          flexShrink: 0,
                          transition: "color 0.25s",
                        }}
                      >
                        {tab.icon}
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "15px",
                            fontWeight: 700,
                            color: activeIdx === i ? DARK : TEXT_BODY,
                            margin: "0 0 4px",
                            transition: "color 0.25s",
                          }}
                        >
                          {tab.label}
                        </p>
                        <p
                          style={{
                            fontSize: "13px",
                            color: MUTED,
                            lineHeight: "20px",
                            margin: 0,
                          }}
                        >
                          {tab.points.map((p) => p.title).join(" · ")}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── RIGHT: phone mockup — hidden on mobile ── */}
            {!isMobile && (
            <div
              style={{
                position: "sticky",
                top: "88px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px 20px",
                background: "#eef0f5",
                borderRadius: "24px",
                minHeight: "500px",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={t.value}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.26, ease: "easeOut" }}
                >
                  <PhoneMockup>
                    {/* App-like screen content */}
                    <div
                      style={{
                        height: "100%",
                        background: `linear-gradient(180deg, rgba(248,86,167,0.09) 0%, ${WHITE} 38%)`,
                        overflowY: "auto",
                      }}
                    >
                      {/* Status bar space (dynamic island) */}
                      <div style={{ height: "52px" }} />

                      {/* App header */}
                      <div style={{ padding: "0 18px 20px" }}>
                        <p
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            color: PINK,
                            letterSpacing: "0.8px",
                            textTransform: "uppercase",
                            margin: "0 0 4px",
                          }}
                        >
                          Mint Foil
                        </p>
                        <h2
                          style={{
                            fontSize: "17px",
                            fontWeight: 700,
                            color: DARK,
                            margin: 0,
                            lineHeight: "22px",
                          }}
                        >
                          {t.title}
                        </h2>
                      </div>

                      {/* Feature points as app rows */}
                      <div style={{ padding: "0 18px" }}>
                        {t.points.map((p, pi) => (
                          <div
                            key={p.id}
                            style={{
                              display: "flex",
                              gap: "12px",
                              alignItems: "flex-start",
                              padding: "12px 0",
                              borderTop:
                                pi === 0
                                  ? `1px solid ${BORDER}`
                                  : `1px solid ${BORDER}`,
                            }}
                          >
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                background: PINK_BG,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: PINK,
                                flexShrink: 0,
                              }}
                            >
                              {p.icon}
                            </div>
                            <div>
                              <p
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  color: DARK,
                                  margin: "0 0 2px",
                                }}
                              >
                                {p.title}
                              </p>
                              <p
                                style={{
                                  fontSize: "10px",
                                  color: MUTED,
                                  lineHeight: "15px",
                                  margin: 0,
                                }}
                              >
                                {p.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PhoneMockup>
                </motion.div>
              </AnimatePresence>
            </div>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ── Key Features Tabs ─────────────────────────────────────────────────────────

const FEATURE_TABS = [
  {
    value: "scan",
    icon: <Camera size={15} />,
    label: "Scan Inteligente",
    desc: "Aponte a câmera e o Mint Foil identifica a carta. Funciona com Pokémon, Magic, Yu-Gi-Oh! e One Piece.",
    mockupIcon: <ScanLine size={40} />,
  },
  {
    value: "precos",
    icon: <DollarSign size={15} />,
    label: "Preços Reais BR",
    desc: "Puxa preços da Liga Pokémon, myP Cards e outros marketplaces BR. O preço real.",
    mockupIcon: <TrendingUp size={40} />,
  },
  {
    value: "portfolio",
    icon: <BarChart3 size={15} />,
    label: "Portfólio Inteligente",
    desc: "Portfólio digital. Gráficos mostram quais cartas estão subindo e caindo.",
    mockupIcon: <BarChart3 size={40} />,
  },
  {
    value: "historico",
    icon: <TrendingUp size={15} />,
    label: "Histórico de Preços",
    desc: "Veja quanto cada carta valeu no passado. Antecipe movimentos de mercado e saiba a hora certa de vender.",
    mockupIcon: <TrendingUp size={40} />,
  },
  {
    value: "alertas",
    icon: <Star size={15} />,
    label: "Alertas de Valorização",
    desc: "Defina um preço-alvo e seja avisado assim que a carta atingir. Nunca mais perca uma oportunidade.",
    mockupIcon: <Star size={40} />,
  },
  {
    value: "multi-tcg",
    icon: <Gamepad2 size={15} />,
    label: "4 Jogos, 1 App",
    desc: "Pokémon, Magic: The Gathering, Yu-Gi-Oh! e One Piece em um único portfólio. Sem precisar de quatro sites.",
    mockupIcon: <Gamepad2 size={40} />,
  },
];

const CAROUSEL_INTERVAL = 5000;

const CARD_W = 600;
const CARD_GAP = 24;
const CARD_LEFT_PAD = 64;

function KeyFeatures() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const isMobile = useIsMobile();
  const [winW, setWinW] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const onResize = () => setWinW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const cardW = isMobile ? winW - 40 : CARD_W;

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () => setActiveIdx((i) => (i + 1) % FEATURE_TABS.length),
      CAROUSEL_INTERVAL
    );
    return () => clearInterval(timer);
  }, [paused]);

  const prev = () =>
    setActiveIdx((i) => (i - 1 + FEATURE_TABS.length) % FEATURE_TABS.length);
  const next = () =>
    setActiveIdx((i) => (i + 1) % FEATURE_TABS.length);

  return (
    <section
      style={{ padding: isMobile ? "80px 0" : "125px 0" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Header ── */}
      <FadeIn>
        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            padding: isMobile ? "0 20px 36px" : "0 24px 52px",
          }}
        >
          <STitle
            badge="Key Features"
            title="Ferramentas que nenhum outro app tem"
            sub="Escaneie cartas com IA, veja preços das ligas brasileiras e organize seu portfólio."
          />
        </div>
      </FadeIn>

      {/* ── Carousel — full viewport width ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
        }}
      >
        {/* Left arrow */}
        <button
          type="button"
          onClick={prev}
          aria-label="Feature anterior"
          style={{
            position: "absolute",
            left: isMobile ? "8px" : "16px",
            top: isMobile ? "120px" : "162px",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: WHITE,
            border: `1px solid ${BORDER}`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            padding: 0,
          }}
        >
          <ChevronLeft size={18} color={DARK} />
        </button>

        {/* Cards strip */}
        <div style={{ overflow: "hidden" }}>
          <motion.div
            style={{ display: "flex", gap: `${CARD_GAP}px`, paddingLeft: isMobile ? "20px" : `${CARD_LEFT_PAD}px` }}
            animate={{ x: -activeIdx * (cardW + CARD_GAP) }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            drag={isMobile ? "x" : false}
            dragConstraints={{ left: -(FEATURE_TABS.length - 1) * (cardW + CARD_GAP), right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) next();
              else if (info.offset.x > 50) prev();
            }}
          >
            {FEATURE_TABS.map((ft) => (
              <div
                key={ft.value}
                style={{
                  width: `${cardW}px`,
                  flexShrink: 0,
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "16px",
                  overflow: "hidden",
                  cursor: "default",
                }}
              >
                {/* ── Video / preview area ── */}
                <div
                  style={{
                    height: isMobile ? "200px" : "325px",
                    position: "relative",
                    background: `linear-gradient(135deg, rgba(248,86,167,0.12) 0%, rgba(181,13,87,0.08) 100%)`,
                    overflow: "hidden",
                  }}
                >
                  {/* Radial glow */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "radial-gradient(ellipse at 50% 110%, rgba(248,86,167,0.22) 0%, transparent 65%)",
                      pointerEvents: "none",
                    }}
                  />
                  {/* Phone mockup clipped at bottom */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-18px",
                      left: "50%",
                      transform: "translateX(-50%) scale(0.65)",
                      transformOrigin: "bottom center",
                      opacity: 0.72,
                    }}
                  >
                    <PhoneMockup>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          padding: "20px",
                        }}
                      >
                        <div style={{ color: PINK }}>{ft.mockupIcon}</div>
                      </div>
                    </PhoneMockup>
                  </div>
                  {/* Play button — top-left */}
                  <div
                    style={{
                      position: "absolute",
                      top: "14px",
                      left: "14px",
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.9)",
                      boxShadow: "0 2px 10px rgba(248,86,167,0.22)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Play
                      size={13}
                      fill={PINK}
                      color={PINK}
                      style={{ marginLeft: "2px" }}
                    />
                  </div>
                </div>

                {/* ── Info area — icon + label + desc ── */}
                <div
                  style={{
                    padding: "18px 20px 22px",
                    borderTop: `1px solid ${BORDER}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      marginBottom: "6px",
                    }}
                  >
                    <span style={{ color: MUTED, display: "flex" }}>
                      {ft.icon}
                    </span>
                    <p
                      style={{
                        fontSize: "20px",
                        lineHeight: "28px",
                        fontWeight: 500,
                        color: "#374151",
                        margin: 0,
                      }}
                    >
                      {ft.label}
                    </p>
                  </div>
                  <p
                    style={{
                      fontSize: "16px",
                      lineHeight: "24px",
                      color: MUTED,
                      margin: 0,
                    }}
                  >
                    {ft.desc}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right arrow */}
        <button
          type="button"
          onClick={next}
          aria-label="Próxima feature"
          style={{
            position: "absolute",
            right: isMobile ? "8px" : "16px",
            top: isMobile ? "120px" : "162px",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: WHITE,
            border: `1px solid ${BORDER}`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            padding: 0,
          }}
        >
          <ChevronRight size={18} color={DARK} />
        </button>
      </div>

      {/* ── Dots ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginTop: "32px",
        }}
      >
        {FEATURE_TABS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIdx(i)}
            style={{
              width: activeIdx === i ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: activeIdx === i ? PINK : BORDER,
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </section>
  );
}

// ── Integrations ──────────────────────────────────────────────────────────────

const TCG_LOGOS = [
  { id: "pokemon", name: "Pokémon TCG", logo: "/logos/pokemon.webp" },
  { id: "magic", name: "Magic: The Gathering", logo: "/logos/magic.webp" },
  { id: "yugioh", name: "Yu-Gi-Oh!", logo: "/logos/yugioh.webp" },
  { id: "onepiece", name: "One Piece TCG", logo: "/logos/one-piece.webp" },
];

const LEAGUE_LOGOS = LEAGUE_LOGOS_SHARED;

const COMING_SOON = [
  { id: "facebook", name: "Facebook", color: "#1877F2", initial: "f" },
  { id: "mercadolivre", name: "Mercado Livre", color: "#FFE600", initial: "ML", dark: true },
];

function CatLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        color: MUTED,
        margin: "0 0 16px",
      }}
    >
      {children}
    </p>
  );
}

function Partners() {
  const isMobile = useIsMobile();
  return (
    <section style={{ background: BG_ALT, padding: isMobile ? "80px 20px" : "125px 24px" }}>
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        <STitle
          badge="Integração"
          title="Conectado ao ecossistema TCG brasileiro"
          sub="Preços das principais ligas e marketplaces do Brasil, direto na sua coleção."
        />

        {/* ── TCGs Suportados ── */}
        <FadeIn>
          <CatLabel>TCGs Suportados</CatLabel>
          <div
            style={{
              display: "flex",
              gap: "24px",
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: "48px",
              padding: "24px 28px",
              background: WHITE,
              borderRadius: "16px",
              border: `1px solid ${BORDER}`,
            }}
          >
            {TCG_LOGOS.map((t) => (
              // biome-ignore lint/performance/noImgElement: local logo assets
              // biome-ignore lint/a11y/noStaticElementInteractions: decorative hover
              <img
                key={t.id}
                src={t.logo}
                alt={t.name}
                title={t.name}
                style={{
                  height: "32px",
                  width: "auto",
                  objectFit: "contain",
                  opacity: 0.85,
                  transition: "opacity 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.85"; }}
              />
            ))}
          </div>
        </FadeIn>

        {/* ── Ligas & Marketplaces ── */}
        <FadeIn delay={0.08}>
          <CatLabel>Ligas & Marketplaces</CatLabel>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "48px",
            }}
          >
            {LEAGUE_LOGOS.map((l) => (
              // biome-ignore lint/a11y/noStaticElementInteractions: decorative hover
              <div
                key={l.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 20px",
                  height: "60px",
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "12px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = PINK_BORDER;
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(248,86,167,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = BORDER;
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* biome-ignore lint/performance/noImgElement: local logo assets */}
                <img
                  src={l.logo}
                  alt={l.name}
                  style={{
                    maxHeight: "30px",
                    maxWidth: "110px",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
            ))}
          </div>
        </FadeIn>

        {/* ── Em breve ── */}
        <FadeIn delay={0.16}>
          <CatLabel>Em breve</CatLabel>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {COMING_SOON.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 16px",
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "12px",
                  opacity: 0.55,
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "7px",
                    background: c.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: c.initial.length > 1 ? "9px" : "15px",
                    fontWeight: 800,
                    color: c.dark ? "#333" : WHITE,
                    flexShrink: 0,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {c.initial}
                </div>
                <span
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 600,
                    color: TEXT_BODY,
                  }}
                >
                  {c.name}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: MUTED,
                    background: "rgba(0,0,0,0.06)",
                    padding: "2px 7px",
                    borderRadius: "100px",
                    letterSpacing: "0.3px",
                    textTransform: "uppercase",
                  }}
                >
                  Em breve
                </span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────

const FREE_FEATURES = [
  "30 scans por dia",
  "Sem criar conta",
  "Portfólio básico",
  "Preços das ligas BR",
];

const PRO_FEATURES = [
  "Scans ilimitados",
  "Portfólio completo",
  "Gráficos de valorização",
  "Todos os marketplaces BR",
  "Novos TCGs prioritários",
  "Suporte prioritário",
];

function Pricing() {
  const isMobile = useIsMobile();
  return (
    <section
      id="planos"
      style={{ padding: isMobile ? "80px 20px" : "125px 24px", maxWidth: "1240px", margin: "0 auto" }}
    >
      <STitle
        badge="Planos"
        title="Grátis pra começar. PRO quando quiser."
        sub="Menos de R$ 0,66/dia. Menos que um booster pack."
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          maxWidth: "680px",
          margin: "0 auto",
        }}
      >
        <FadeIn>
          <div
            style={{
              padding: "32px 28px",
              borderRadius: "18px",
              background: WHITE,
              border: `1px solid ${BORDER}`,
              height: "100%",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: MUTED,
                textTransform: "uppercase",
                letterSpacing: "1px",
                margin: "0 0 6px",
              }}
            >
              Gratuito
            </p>
            <p
              style={{
                fontSize: "32px",
                fontWeight: 800,
                color: DARK,
                margin: "0 0 4px",
              }}
            >
              R$ 0
            </p>
            <p style={{ fontSize: "13px", color: MUTED, margin: "0 0 24px" }}>
              Pra sempre
            </p>
            {FREE_FEATURES.map((f) => (
              <div
                key={f}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <Check size={14} color={PINK} />
                <span style={{ fontSize: "13.5px", color: TEXT_BODY }}>
                  {f}
                </span>
              </div>
            ))}
            <div style={{ marginTop: "20px" }}>
              <GradBtn ghost full>
                Começar grátis
              </GradBtn>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div
            style={{
              padding: "32px 28px",
              borderRadius: "18px",
              background: PINK_BG,
              border: `1px solid rgba(248,86,167,0.25)`,
              position: "relative",
              height: "100%",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                background: GRAD,
                color: WHITE,
                fontSize: "10px",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "100px",
                textTransform: "uppercase",
              }}
            >
              Popular
            </div>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: PINK,
                textTransform: "uppercase",
                letterSpacing: "1px",
                margin: "0 0 6px",
              }}
            >
              PRO
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "4px",
                margin: "0 0 4px",
              }}
            >
              <span style={{ fontSize: "32px", fontWeight: 800, color: DARK }}>
                R$ 19,90
              </span>
              <span style={{ fontSize: "13px", color: MUTED }}>/mês</span>
            </div>
            <p style={{ fontSize: "13px", color: MUTED, margin: "0 0 24px" }}>
              Tudo liberado
            </p>
            {PRO_FEATURES.map((f) => (
              <div
                key={f}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <Check size={14} color={PINK} />
                <span style={{ fontSize: "13.5px", color: TEXT_BODY }}>
                  {f}
                </span>
              </div>
            ))}
            <div style={{ marginTop: "20px" }}>
              <GradBtn full>
                <ArrowRight size={14} /> Assinar PRO
              </GradBtn>
            </div>
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={0.2}>
        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: MUTED,
            marginTop: "28px",
            maxWidth: "460px",
            margin: "28px auto 0",
            lineHeight: 1.6,
          }}
        >
          Cancele quando quiser. Basta encontrar{" "}
          <strong style={{ color: PINK }}>UMA</strong> carta que vale mais do
          que pensava.
        </p>
      </FadeIn>
    </section>
  );
}

// ── Objections & FAQ ──────────────────────────────────────────────────────────

const OBJECTION_ITEMS = [
  {
    id: "gringo",
    q: '"Já uso app gringo com tradução pra português."',
    a: "Tradução de idioma não é tradução de mercado. O Mint Foil puxa preço real das ligas brasileiras.",
  },
  {
    id: "liga",
    q: '"Consulto no site da liga."',
    a: "Sites não têm scan, portfólio ou gráfico. Servem pra 1 carta. Se tem centenas, precisa de escala.",
  },
  {
    id: "gratis",
    q: '"Prefiro grátis."',
    a: "Use grátis. 30 scans/dia. O PRO custa R$ 19,90 — menos que um booster.",
  },
  {
    id: "consolidado",
    q: '"App gringo é mais consolidado."',
    a: "No mercado deles. Nenhum tem vínculo com ligas brasileiras.",
  },
  {
    id: "confio",
    q: '"Não confio no preço."',
    a: "Preços direto das ligas e marketplaces BR — onde você compra e vende.",
  },
];

const FAQ_ITEMS = [
  {
    id: "jogos",
    q: "Quais jogos funcionam?",
    a: "Pokémon, Magic, Yu-Gi-Oh! e One Piece.",
  },
  {
    id: "precos",
    q: "De onde vêm os preços?",
    a: "Ligas e marketplaces brasileiros.",
  },
  { id: "conta", q: "Preciso criar conta?", a: "Não. 30 scans/dia sem logar." },
  {
    id: "plataformas",
    q: "Funciona no celular e PC?",
    a: "Sim. App com scan + web.",
  },
  {
    id: "preco",
    q: "R$ 19,90 é caro?",
    a: "Menos de R$ 0,66/dia. Uma carta que vale mais já paga meses.",
  },
  { id: "cancelar", q: "Posso cancelar?", a: "Sim. Sem multa." },
  {
    id: "loja",
    q: "Serve pra loja?",
    a: "Sim. Scan em volume + estoque digital.",
  },
];

function AccordionSection({
  items,
}: {
  items: { id: string; q: string; a: string }[];
}) {
  return (
    <Accordion
      type="single"
      collapsible
      className="max-w-2xl mx-auto w-full flex flex-col gap-2.5"
    >
      {items.map((item, i) => (
        <FadeIn key={item.id} delay={i * 0.05}>
          <AccordionItem
            value={item.id}
            className="rounded-xl border px-1 last:border-b"
            style={{ borderColor: BORDER, background: WHITE }}
          >
            <AccordionTrigger
              className="px-5 py-4 text-sm font-semibold hover:no-underline"
              style={{ color: DARK }}
            >
              {item.q}
            </AccordionTrigger>
            <AccordionContent
              className="px-5 pb-4 text-sm leading-relaxed"
              style={{ color: MUTED }}
            >
              {item.a}
            </AccordionContent>
          </AccordionItem>
        </FadeIn>
      ))}
    </Accordion>
  );
}

function Objections() {
  return (
    <section style={{ background: BG_ALT, padding: "125px 24px" }}>
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        <STitle badge="Objeções" title="Talvez você esteja pensando..." />
        <AccordionSection items={OBJECTION_ITEMS} />
      </div>
    </section>
  );
}

function FAQSection() {
  const isMobile = useIsMobile();
  return (
    <section
      id="faq"
      style={{ padding: isMobile ? "80px 20px" : "125px 24px", maxWidth: "1240px", margin: "0 auto" }}
    >
      <STitle badge="FAQ" title="Perguntas frequentes" />
      <AccordionSection items={FAQ_ITEMS} />
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────

function FinalCTA() {
  const isMobile = useIsMobile();
  return (
    <section style={{ background: BG_ALT, padding: isMobile ? "80px 20px" : "125px 24px" }}>
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
        }}
      >
        <FadeIn>
          <h2
            style={{
              fontSize: "clamp(24px, 4.5vw, 38px)",
              fontWeight: 700,
              color: DARK,
              lineHeight: 1.15,
              margin: "0 0 18px",
            }}
          >
            Sua coleção é como dinheiro guardado{" "}
            <span
              style={{
                background: GRAD,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              numa caixa sem rótulo.
            </span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.12}>
          <p
            style={{
              fontSize: "16px",
              color: MUTED,
              lineHeight: 1.7,
              margin: "0 0 32px",
            }}
          >
            Cartas de R$ 2 até R$ 500+. O Mint Foil mostra o valor real.
          </p>
        </FadeIn>
        <FadeIn delay={0.24}>
          <GradBtn>
            <ArrowRight size={14} /> Baixar Grátis
          </GradBtn>
          <p style={{ fontSize: "12px", color: MUTED, marginTop: "12px" }}>
            30 scans/dia · Sem conta · Sem cartão
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ── Footer (gsap aurora) ──────────────────────────────────────────────────────

function FooterSection() {
  const auroraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = auroraRef.current;
    if (!el) return;
    const tween = gsap.to(el, {
      scale: 1.12,
      opacity: 0.14,
      duration: 8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <footer
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "100px 24px 40px",
        background: DARK,
        color: WHITE,
      }}
    >
      {/* GSAP aurora glow */}
      <div
        ref={auroraRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80vw",
          height: "60vh",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(248,86,167,0.1) 0%, transparent 70%)",
          filter: "blur(80px)",
          opacity: 0.08,
          pointerEvents: "none",
        }}
      />

      {/* Large background text */}
      <div
        style={{
          position: "absolute",
          bottom: "-5vh",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "clamp(80px, 20vw, 260px)",
          fontWeight: 900,
          letterSpacing: "-0.05em",
          color: "transparent",
          WebkitTextStroke: "1px rgba(255,255,255,0.03)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 60%)",
          WebkitBackgroundClip: "text",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          userSelect: "none",
          lineHeight: 0.75,
        }}
      >
        MINT FOIL
      </div>

      {/* Diagonal marquee band */}
      <div
        style={{
          position: "absolute",
          top: "32px",
          left: 0,
          width: "100%",
          overflow: "hidden",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(2,6,23,0.6)",
          backdropFilter: "blur(10px)",
          padding: "10px 0",
          transform: "rotate(-1deg) scale(1.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "max-content",
            animation: "footerMarquee 40s linear infinite",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "28px",
              paddingRight: "28px",
            }}
          >
            {FOOTER_MARQUEE_ITEMS.map(({ text, id }) => (
              <span
                key={id}
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: text === "✦" ? PINK : "rgba(255,255,255,0.4)",
                  whiteSpace: "nowrap",
                }}
              >
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(32px, 7vw, 64px)",
            fontWeight: 800,
            background:
              "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.3) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-2px",
            marginBottom: "36px",
          }}
        >
          Pronto pra começar?
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <GradBtn>
            <Smartphone size={16} /> Download iOS
          </GradBtn>
          <GradBtn>
            <Smartphone size={16} /> Download Android
          </GradBtn>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "60px",
          }}
        >
          {["Privacidade", "Termos", "Suporte"].map((t) => (
            <button
              key={t}
              type="button"
              style={{
                background: "none",
                border: "none",
                fontSize: "13px",
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                transition: "color 0.25s",
                padding: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = WHITE;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.4)";
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          maxWidth: "900px",
          margin: "0 auto",
          paddingTop: "24px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.35)",
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
          }}
        >
          © 2025 Mint Foil
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "100px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.4)",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Feito com
          </span>
          <Heart
            size={14}
            color="#EF4444"
            fill="#EF4444"
            style={{ animation: "heartbeat 2s ease-in-out infinite" }}
          />
          <span
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.4)",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            no Brasil
          </span>
        </div>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "rgba(255,255,255,0.4)",
            transition: "color 0.25s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = WHITE;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.4)";
          }}
        >
          <ChevronUp size={16} />
        </button>
      </div>
    </footer>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div
      style={{
        background: WHITE,
        color: DARK,
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <Nav />
      <Hero />
      <VideoSection />
      <RevealSection />
      <Pain />
      <Solution />
      <BenefitsTabs />
      <KeyFeatures />
      <Partners />
      <Pricing />
      <Objections />
      <FAQSection />
      <FinalCTA />
      <FooterSection />
    </div>
  );
}
