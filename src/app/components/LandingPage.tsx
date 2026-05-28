"use client";

import gsap from "gsap";
import {
  ArrowRight,
  BarChart3,
  Camera,
  Check,
  ChevronUp,
  DollarSign,
  ExternalLink,
  Gamepad2,
  Globe,
  Instagram,
  LayoutDashboard,
  Moon,
  Play,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Store,
  Sun,
  TrendingUp,
  Twitter,
  Users,
  Youtube,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Badge } from "@/components/ui/badge";
import { CinematicHero } from "@/components/ui/cinematic-landing-hero";

// ── Theme ─────────────────────────────────────────────────────────────────────

type Theme = {
  bg: string;
  bgAlt: string;
  primary: string;
  text: string;
  textBody: string;
  muted: string;
  border: string;
  primaryBorder: string;
  primaryBg: string;
  cardBg: string;
  isDark: boolean;
};

const LIGHT: Theme = {
  bg: "#FFFFFF",
  bgAlt: "#F6F6F6",
  primary: "#B50D57",
  text: "#020617",
  textBody: "#4a4a68",
  muted: "rgba(0,0,0,0.45)",
  border: "rgba(0,0,0,0.08)",
  primaryBorder: "rgba(181,13,87,0.2)",
  primaryBg: "rgba(181,13,87,0.07)",
  cardBg: "#FFFFFF",
  isDark: false,
};

const DARK: Theme = {
  bg: "#020617",
  bgAlt: "#021937",
  primary: "#F856A7",
  text: "#FFFFFF",
  textBody: "rgba(255,255,255,0.82)",
  muted: "rgba(255,255,255,0.48)",
  border: "rgba(255,255,255,0.1)",
  primaryBorder: "rgba(248,86,167,0.22)",
  primaryBg: "rgba(248,86,167,0.07)",
  cardBg: "#021937",
  isDark: true,
};

const ThemeCtx = createContext<Theme>(LIGHT);
const useTheme = () => useContext(ThemeCtx);

// ── Motion variants ───────────────────────────────────────────────────────────

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

// ── Card data — 30-card marquee (no repeats, mixed TCGs) ──────────────────────

const MARQUEE_SRCS = [
  // Pokémon 12
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
  // Yu-Gi-Oh! 8
  "https://images.ygoprodeck.com/images/cards/89631139.jpg",
  "https://images.ygoprodeck.com/images/cards/46986414.jpg",
  "https://images.ygoprodeck.com/images/cards/33396948.jpg",
  "https://images.ygoprodeck.com/images/cards/74677422.jpg",
  "https://images.ygoprodeck.com/images/cards/38033121.jpg",
  "https://images.ygoprodeck.com/images/cards/44508094.jpg",
  "https://images.ygoprodeck.com/images/cards/23995346.jpg",
  "https://images.ygoprodeck.com/images/cards/61854111.jpg",
  // Magic 5
  "https://cards.scryfall.io/large/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7571.jpg",
  "https://cards.scryfall.io/large/front/4/c/4cbc6901-6a4a-4d0a-83ea-7eefa3b35021.jpg",
  "https://cards.scryfall.io/large/front/e/3/e3285e6b-3e79-4d7c-bf96-d920f973b122.jpg",
  "https://cards.scryfall.io/large/front/c/8/c8817585-0d32-4d56-9142-0d29512e86a9.jpg",
  "https://cards.scryfall.io/large/front/e/6/e653437e-2e56-4443-aec5-5bb7d8860238.jpg",
  // One Piece (placeholders) 5
  "https://images.pokemontcg.io/sv3pt5/230_hires.png",
  "https://images.pokemontcg.io/sv4pt5/234_hires.png",
  "https://images.pokemontcg.io/swsh12pt5/160_hires.png",
  "https://images.pokemontcg.io/swsh9/166_hires.png",
  "https://images.pokemontcg.io/swsh12pt5/GG70_hires.png",
];

// Tripled for seamless CSS loop — stable IDs
const DUPED_MARQUEE = ["a", "b", "c"].flatMap((p) =>
  MARQUEE_SRCS.map((src, n) => ({
    src,
    id: `${p}${n}`,
    rot: n % 2 === 0 ? 7 : -7,
  })),
);

// Footer marquee doubled
const FOOTER_BAND = [
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

// Reveal section — 6 TCGs
const REVEAL_ITEMS = [
  {
    text: "Pokémon",
    imgs: [
      "https://images.pokemontcg.io/swsh7/215_hires.png",
      "https://images.pokemontcg.io/sv3/234_hires.png",
    ],
  },
  {
    text: "Yu-Gi-Oh!",
    imgs: [
      "https://images.ygoprodeck.com/images/cards/89631139.jpg",
      "https://images.ygoprodeck.com/images/cards/46986414.jpg",
    ],
  },
  {
    text: "Magic",
    imgs: [
      "https://cards.scryfall.io/large/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7571.jpg",
      "https://cards.scryfall.io/large/front/4/c/4cbc6901-6a4a-4d0a-83ea-7eefa3b35021.jpg",
    ],
  },
  {
    text: "One Piece",
    imgs: [
      "https://images.pokemontcg.io/sv3pt5/230_hires.png",
      "https://images.pokemontcg.io/sv4pt5/234_hires.png",
    ],
  },
  {
    text: "Dragon Ball",
    imgs: [
      "https://images.ygoprodeck.com/images/cards/44508094.jpg",
      "https://images.ygoprodeck.com/images/cards/23995346.jpg",
    ],
  },
  {
    text: "Digimon",
    imgs: [
      "https://images.pokemontcg.io/swsh8/269_hires.png",
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
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// In dark mode: white bg + dark (#021937) text — inverts theme context for children
const DARK_ALT: Theme = {
  bg: "#FFFFFF",
  bgAlt: "#F6F6F6",
  primary: "#B50D57",
  text: "#021937",
  textBody: "#1e3a5f",
  muted: "rgba(2,25,55,0.45)",
  border: "rgba(2,25,55,0.1)",
  primaryBorder: "rgba(181,13,87,0.2)",
  primaryBg: "rgba(181,13,87,0.07)",
  cardBg: "#F6F6F6",
  isDark: false,
};

function AltSection({
  children,
  id,
  style,
}: {
  children: ReactNode;
  id?: string;
  style?: React.CSSProperties;
}) {
  const outer = useTheme();
  const theme = outer.isDark ? DARK_ALT : outer;
  return (
    <ThemeCtx.Provider value={theme}>
      <section
        id={id}
        style={{
          background: outer.isDark ? "#FFFFFF" : outer.bgAlt,
          padding: "100px 24px",
          ...style,
        }}
      >
        {children}
      </section>
    </ThemeCtx.Provider>
  );
}

function PrimaryBtn({
  children,
  ghost = false,
  full = false,
  small = false,
  dark = false,
  onClick,
}: {
  children: ReactNode;
  ghost?: boolean;
  full?: boolean;
  small?: boolean;
  dark?: boolean;
  onClick?: () => void;
}) {
  const t = useTheme();
  const primary = dark ? "#F856A7" : t.primary;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: small ? "9px 22px" : "13px 28px",
        borderRadius: "10px",
        border: ghost
          ? `1px solid ${dark ? "rgba(248,86,167,0.35)" : t.primaryBorder}`
          : "none",
        background: ghost ? "transparent" : primary,
        color: "#FFFFFF",
        fontSize: small ? "13px" : "14px",
        fontWeight: 600,
        cursor: "pointer",
        width: full ? "100%" : "auto",
        transition: "opacity 0.18s ease",
        letterSpacing: "0.15px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.80";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
}

// Official-style App Store / Google Play badge
function StoreBadge({ store }: { store: "ios" | "android" }) {
  const isIos = store === "ios";
  return (
    <button
      type="button"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 18px",
        borderRadius: "12px",
        background: "#000000",
        border: "1px solid rgba(255,255,255,0.15)",
        cursor: "pointer",
        transition: "opacity 0.18s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.82";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
    >
      {isIos ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="white"
          aria-hidden="true"
        >
          <path d="M14.94 5.19A4.38 4.38 0 0 0 16 2a4.44 4.44 0 0 0-3 1.52 4.17 4.17 0 0 0-1 3.09 3.69 3.69 0 0 0 2.94-1.42zm2.52 7.44a4.51 4.51 0 0 1 2.16-3.81 4.66 4.66 0 0 0-3.66-2c-1.56-.16-3 .91-3.83.91-.83 0-2-.89-3.3-.87a4.92 4.92 0 0 0-4.14 2.53C2.89 12.03 4.1 17 5.86 19.47c.93 1.21 2 2.55 3.41 2.5 1.41-.05 1.91-.86 3.59-.86 1.68 0 2.16.86 3.61.83 1.45-.03 2.39-1.24 3.32-2.45a10.94 10.94 0 0 0 1.49-2.83 4.39 4.39 0 0 1-2.82-4.03z" />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="white"
          aria-hidden="true"
        >
          <path d="M3.18 23.76a2 2 0 0 0 2.74.75L17 17.84l-3.4-3.4zM22 10.46a2 2 0 0 0 0-3.46L19.15 5.4 15.42 9l3.73 3.73zM1.25 1.5A2 2 0 0 0 1 2.5v19a2 2 0 0 0 .25 1L13 11zM17 6.16 5.92.49A2 2 0 0 0 3.18.25L13.6 11z" />
        </svg>
      )}
      <div style={{ textAlign: "left" }}>
        <div
          style={{
            fontSize: "9px",
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.2,
          }}
        >
          {isIos ? "Download on the" : "Get it on"}
        </div>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#FFFFFF",
            lineHeight: 1.2,
          }}
        >
          {isIos ? "App Store" : "Google Play"}
        </div>
      </div>
    </button>
  );
}

function PinkBadge({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <Badge
      variant="outline"
      className="rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-widest"
      style={{
        background: t.primaryBg,
        color: t.primary,
        borderColor: t.primaryBorder,
      }}
    >
      {children}
    </Badge>
  );
}

function PhoneMockup({
  children,
  size = "md",
}: {
  children?: ReactNode;
  size?: "sm" | "md";
}) {
  const t = useTheme();
  const w = size === "sm" ? "180px" : "240px";
  return (
    <div
      style={{
        width: w,
        padding: "8px",
        borderRadius: "32px",
        background: t.isDark
          ? "linear-gradient(145deg, #1a1a2e 0%, #0d0d1a 100%)"
          : "linear-gradient(145deg, #e8e8ef 0%, #d0d0db 100%)",
        border: `1px solid ${t.border}`,
        position: "relative",
        boxShadow: t.isDark
          ? "0 20px 60px rgba(0,0,0,0.5)"
          : "0 20px 60px rgba(0,0,0,0.12)",
      }}
    >
      {/* Notch */}
      <div
        style={{
          position: "absolute",
          top: "8px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "70px",
          height: "20px",
          borderRadius: "12px",
          background: t.isDark ? "#0d0d1a" : "#c8c8d2",
          zIndex: 5,
        }}
      />
      <div
        style={{
          borderRadius: "24px",
          overflow: "hidden",
          background: t.cardBg,
          aspectRatio: "9/19.5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children ?? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              padding: "20px",
            }}
          >
            <ScanLine size={size === "sm" ? 22 : 28} color={t.primary} />
            <p style={{ fontSize: "10px", color: t.muted }}>
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
  const t = useTheme();
  return (
    <div style={{ textAlign: "center", marginBottom: "52px" }}>
      {badge && (
        <FadeIn>
          <PinkBadge>{badge}</PinkBadge>
        </FadeIn>
      )}
      <FadeIn delay={0.1}>
        <h2
          style={{
            fontSize: "clamp(26px, 4.5vw, 42px)",
            fontWeight: 700,
            color: t.text,
            margin: badge ? "14px 0 0" : 0,
            lineHeight: 1.12,
          }}
        >
          {title}
        </h2>
      </FadeIn>
      {sub && (
        <FadeIn delay={0.18}>
          <p
            style={{
              fontSize: "16px",
              color: t.muted,
              maxWidth: "540px",
              margin: "14px auto 0",
              lineHeight: 1.7,
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
  { label: "Recursos", href: "#recursos" },
  { label: "Planos", href: "#planos" },
  { label: "FAQ", href: "#faq" },
];

function Nav({
  isDark,
  onToggle,
}: {
  isDark: boolean;
  onToggle: (ref: React.RefObject<HTMLButtonElement | null>) => void;
}) {
  const t = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
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
        zIndex: 9999,
        padding: "13px 28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: scrolled
          ? isDark
            ? "rgba(2,6,23,0.92)"
            : "rgba(255,255,255,0.92)"
          : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled
          ? `1px solid ${t.border}`
          : "1px solid transparent",
        transition: "all 0.3s ease",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "7px",
            background: t.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: 800,
            color: "#FFFFFF",
          }}
        >
          M
        </div>
        <span style={{ fontSize: "15px", fontWeight: 700, color: t.text }}>
          Mint Foil
        </span>
      </div>

      {/* Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
        {NAV_LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            style={{
              fontSize: "13.5px",
              fontWeight: 500,
              color: t.muted,
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = t.text;
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = t.muted;
            }}
          >
            {l.label}
          </a>
        ))}
        <a
          href="/loja"
          style={{
            fontSize: "13.5px",
            fontWeight: 500,
            color: t.primary,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          Loja <ExternalLink size={11} />
        </a>

        {/* Dark/light toggle */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => onToggle(toggleRef)}
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: t.primaryBg,
            border: `1px solid ${t.primaryBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: t.primary,
            transition: "all 0.2s",
          }}
          aria-label="Alternar tema"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <PrimaryBtn small>
          <ArrowRight size={13} /> Explorar Agora
        </PrimaryBtn>
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  const t = useTheme();
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: "130px",
        overflow: "hidden",
        background: t.bg,
      }}
    >
      {/* Spotlight radial gradient */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1000px",
          height: "600px",
          background: `radial-gradient(ellipse at center, ${t.primaryBg} 0%, transparent 65%)`,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Stagger block */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        style={{
          maxWidth: "820px",
          textAlign: "center",
          position: "relative",
          zIndex: 10,
          padding: "0 24px",
        }}
      >
        <motion.div variants={fadeUp}>
          <PinkBadge>Lançamento 2025</PinkBadge>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          style={{
            fontSize: "clamp(38px, 6.5vw, 72px)",
            fontWeight: 800,
            color: t.text,
            lineHeight: 1.04,
            margin: "22px 0 0",
            letterSpacing: "-1px",
          }}
        >
          Você tem centenas de cartas e{" "}
          <span style={{ color: t.primary }}>não sabe quanto valem.</span>
          <br />
          Agora vai saber.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          style={{
            fontSize: "clamp(15px, 2.2vw, 18px)",
            color: t.textBody,
            maxWidth: "600px",
            margin: "22px auto 0",
            lineHeight: 1.7,
          }}
        >
          Escaneie suas cartas de Pokémon, Magic, Yu-Gi-Oh! e One Piece.
          Organize num portfólio. Monitore o preço real das ligas brasileiras.
          No celular ou na web.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUp}>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              marginTop: "34px",
              flexWrap: "wrap",
            }}
          >
            <PrimaryBtn>
              <ArrowRight size={16} /> Explorar Agora
            </PrimaryBtn>
            <PrimaryBtn ghost>
              <Play size={14} /> Ver como funciona
            </PrimaryBtn>
          </div>
        </motion.div>

        {/* Download badges */}
        <motion.div variants={fadeUp}>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >
            <StoreBadge store="ios" />
            <StoreBadge store="android" />
          </div>
          <p style={{ fontSize: "11px", color: t.muted, marginTop: "12px" }}>
            Disponível para iOS, Android e Web
          </p>
        </motion.div>
      </motion.div>

      {/* Card marquee — bigger cards, positioned lower */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.7 }}
        style={{
          position: "absolute",
          bottom: "0",
          left: 0,
          width: "100%",
          height: "35%",
          maskImage:
            "linear-gradient(to bottom, transparent, black 30%, black 65%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 30%, black 65%, transparent)",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "18px",
            animation: "marquee 55s linear infinite",
            width: "max-content",
          }}
        >
          {DUPED_MARQUEE.map(({ src, id, rot }) => (
            <div
              key={id}
              style={{
                height: "220px",
                aspectRatio: "3/4.2",
                flexShrink: 0,
                transform: `rotate(${rot}deg)`,
              }}
            >
              {/* biome-ignore lint/performance/noImgElement: external TCG card URLs require referrerPolicy */}
              <img
                src={src}
                alt=""
                referrerPolicy="no-referrer"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: "10px",
                  filter: "drop-shadow(0 6px 22px rgba(0,0,0,0.18))",
                }}
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
  const t = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <AltSection style={{ padding: "80px 24px", position: "relative" }}>
      {/* Radial glow behind card */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "900px",
          height: "400px",
          background: `radial-gradient(ellipse at center, ${t.primaryBg} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}
      >
        <STitle
          badge="Veja em ação"
          title="Conheça a interface do Mint Foil"
          sub="Navegue pela versão web e veja como funciona na prática."
        />
        <FadeIn>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: hover shadow on video card */}
          <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              borderRadius: "20px",
              overflow: "hidden",
              background: t.cardBg,
              border: `1px solid ${t.border}`,
              aspectRatio: "16/9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "box-shadow 0.35s ease",
              boxShadow: hovered
                ? `0 24px 64px rgba(0,0,0,${t.isDark ? "0.5" : "0.15"})`
                : "none",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: t.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  transition: "transform 0.2s ease",
                  transform: hovered ? "scale(1.08)" : "scale(1)",
                }}
              >
                <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
              </div>
              <p style={{ fontSize: "14px", color: t.muted }}>
                Clique para assistir o vídeo
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </AltSection>
  );
}

// ── Reveal hover ──────────────────────────────────────────────────────────────

function RevealItem({ text, imgs }: { text: string; imgs: string[] }) {
  const t = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ position: "relative", padding: "12px 0", overflow: "visible" }}
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
            fontSize: "clamp(52px, 9vw, 88px)",
            fontWeight: 800,
            color: t.text,
            textTransform: "uppercase",
            lineHeight: 1,
            transition: "opacity 0.38s ease",
            opacity: hovered ? 0.15 : 1,
            letterSpacing: "-1.5px",
          }}
        >
          {text}
        </h3>
      </button>

      {/* Back card (left, behind) */}
      <div
        style={{
          position: "absolute",
          left: "38%",
          top: "50%",
          zIndex: 39,
          width: "108px",
          height: "152px",
          transform: hovered
            ? "translateX(-48px) translateY(-50%) rotate(-10deg) scale(1)"
            : "translateX(-20px) translateY(-50%) rotate(-5deg) scale(0.85)",
          opacity: hovered ? 1 : 0,
          transition: "all 0.42s ease-out 0.06s",
          pointerEvents: "none",
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: external TCG card URLs require referrerPolicy */}
        <img
          src={imgs[0]}
          alt=""
          referrerPolicy="no-referrer"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: "8px",
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.22))",
          }}
        />
      </div>

      {/* Front card (right, in front) */}
      <div
        style={{
          position: "absolute",
          left: "45%",
          top: "50%",
          zIndex: 40,
          width: "108px",
          height: "152px",
          transform: hovered
            ? "translateX(0) translateY(-50%) rotate(4deg) scale(1)"
            : "translateX(14px) translateY(-50%) rotate(4deg) scale(0.85)",
          opacity: hovered ? 1 : 0,
          transition: "all 0.36s ease-out",
          pointerEvents: "none",
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: external TCG card URLs require referrerPolicy */}
        <img
          src={imgs[1]}
          alt=""
          referrerPolicy="no-referrer"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: "8px",
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.22))",
          }}
        />
      </div>
    </div>
  );
}

function RevealSection() {
  const t = useTheme();
  return (
    <section id="colecoes" style={{ padding: "100px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <STitle badge="Coleções" title="Explore seus jogos favoritos" />
        <div style={{ maxWidth: "580px", margin: "0 auto" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: t.muted,
              marginBottom: "8px",
            }}
          >
            Coleções Mintfoil
          </p>
          {REVEAL_ITEMS.map(({ text, imgs }) => (
            <RevealItem key={text} text={text} imgs={imgs} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pain ──────────────────────────────────────────────────────────────────────

const PAINS = [
  {
    id: "valor",
    icon: <ScanLine size={24} />,
    title: "Não sabe o valor",
    desc: "Cartas que podem valer R$ 5 ou R$ 500. Você não sabe qual é qual.",
  },
  {
    id: "horas",
    icon: <TrendingUp size={24} />,
    title: "Perde horas pesquisando",
    desc: "Abre a liga, pesquisa carta por carta. Consultou 10, cansou. Faltam 300.",
  },
  {
    id: "gringo",
    icon: <Globe size={24} />,
    title: "App gringo, preço errado",
    desc: "Converte dólar pra real. O preço não tem nada a ver com o mercado BR.",
  },
  {
    id: "barato",
    icon: <DollarSign size={24} />,
    title: "Já vendeu barato",
    desc: "Vendeu carta por um valor que depois descobriu que estava errado.",
  },
  {
    id: "catalogo",
    icon: <LayoutDashboard size={24} />,
    title: "Coleção sem catálogo",
    desc: "Caixas cheias de cartas nunca catalogadas. Pode ter fortuna ali.",
  },
  {
    id: "jogos",
    icon: <Gamepad2 size={24} />,
    title: "4 jogos, 4 problemas",
    desc: "Pokémon, Magic, Yu-Gi-Oh!, One Piece. Precisaria de 4 sites.",
  },
];

function Pain() {
  const t = useTheme();
  return (
    <AltSection>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <STitle
          badge="O Problema"
          title="Colecionar é fácil. Saber o valor real, não."
          sub="Se coleciona cards de mais de um jogo, já sentiu pelo menos três dessas:"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {PAINS.map((p, i) => (
            <FadeIn key={p.id} delay={i * 0.07}>
              <div style={{ position: "relative" }}>
                {/* Radial glow behind card */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at 50% 0%, ${t.primaryBg} 0%, transparent 70%)`,
                    borderRadius: "16px",
                    pointerEvents: "none",
                  }}
                />
                {/* biome-ignore lint/a11y/noStaticElementInteractions: decorative border hover */}
                <div
                  style={{
                    background: t.cardBg,
                    border: `1px solid ${t.border}`,
                    borderRadius: "16px",
                    padding: "28px 24px",
                    height: "100%",
                    transition: "border-color 0.3s",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = t.primaryBorder;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = t.border;
                  }}
                >
                  {/* Icon circle */}
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "14px",
                      background: t.primaryBg,
                      border: `1px solid ${t.primaryBorder}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: t.primary,
                      marginBottom: "16px",
                    }}
                  >
                    {p.icon}
                  </div>
                  <h4
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: t.text,
                      marginBottom: "8px",
                    }}
                  >
                    {p.title}
                  </h4>
                  <p
                    style={{
                      fontSize: "13.5px",
                      color: t.muted,
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {p.desc}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </AltSection>
  );
}

// ── Benefits — text outside card, mockup bleeding ─────────────────────────────

const BENEFIT_TABS = [
  {
    value: "colecionadores",
    label: "Colecionadores",
    icon: <Users size={15} />,
    title: "Descubra o valor real!",
    points: [
      {
        id: "scan",
        icon: <Camera size={16} />,
        title: "Scan instantâneo",
        desc: "Aponte, escaneie, veja o preço. Segundos.",
      },
      {
        id: "valorizacao",
        icon: <TrendingUp size={16} />,
        title: "Monitore valorização",
        desc: "Gráficos de preço. Saiba quando vender.",
      },
      {
        id: "tesouros",
        icon: <ScanLine size={16} />,
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
        icon: <Zap size={16} />,
        title: "Volume rápido",
        desc: "Pack aberto → scan em sequência → catalogado.",
      },
      {
        id: "preco",
        icon: <DollarSign size={16} />,
        title: "Preço BR real",
        desc: "Preços das ligas brasileiras direto.",
      },
      {
        id: "estoque",
        icon: <LayoutDashboard size={16} />,
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
        icon: <ShieldCheck size={16} />,
        title: "Valor antes da troca",
        desc: "Confira preço real antes de trocar.",
      },
      {
        id: "app",
        icon: <Gamepad2 size={16} />,
        title: "Tudo num app",
        desc: "Pokémon, Magic, Yu-Gi-Oh!, One Piece.",
      },
      {
        id: "torneio",
        icon: <Smartphone size={16} />,
        title: "Leve pra torneio",
        desc: "Portfólio no celular, sempre.",
      },
    ],
    mockupIcon: <Gamepad2 size={28} />,
  },
];

function Benefits() {
  const t = useTheme();
  const [active, setActive] = useState("colecionadores");
  const cur = BENEFIT_TABS.find((tb) => tb.value === active) ?? BENEFIT_TABS[0];

  return (
    <section style={{ padding: "100px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <STitle badge="Benefícios" title="O Mint Foil se adapta a você" />
        <FadeIn>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "60px",
              alignItems: "center",
              maxWidth: "940px",
              margin: "0 auto",
            }}
          >
            {/* Left: text area */}
            <div>
              {/* Tab triggers */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "36px",
                  flexWrap: "wrap",
                }}
              >
                {BENEFIT_TABS.map((tb) => (
                  <button
                    key={tb.value}
                    type="button"
                    onClick={() => setActive(tb.value)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "9px 18px",
                      borderRadius: "10px",
                      border: "none",
                      cursor: "pointer",
                      background:
                        active === tb.value ? t.primaryBg : "transparent",
                      color: active === tb.value ? t.primary : t.muted,
                      fontWeight: 600,
                      fontSize: "13px",
                      transition: "all 0.22s",
                      outline:
                        active === tb.value
                          ? `1px solid ${t.primaryBorder}`
                          : "1px solid transparent",
                    }}
                  >
                    {tb.icon}
                    {tb.label}
                  </button>
                ))}
              </div>

              {/* Animated content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 14 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <h3
                    style={{
                      fontSize: "clamp(22px, 3vw, 28px)",
                      fontWeight: 700,
                      color: t.text,
                      lineHeight: 1.15,
                      marginBottom: "28px",
                    }}
                  >
                    {cur.title}
                  </h3>
                  {cur.points.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: "flex",
                        gap: "14px",
                        alignItems: "flex-start",
                        marginBottom: "20px",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          background: t.primaryBg,
                          border: `1px solid ${t.primaryBorder}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: t.primary,
                          flexShrink: 0,
                        }}
                      >
                        {p.icon}
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: t.text,
                            margin: "0 0 3px",
                          }}
                        >
                          {p.title}
                        </p>
                        <p
                          style={{
                            fontSize: "13px",
                            color: t.muted,
                            lineHeight: 1.6,
                            margin: 0,
                          }}
                        >
                          {p.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: card with bleeding mockup */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  background: t.cardBg,
                  border: `1px solid ${t.border}`,
                  borderRadius: "24px",
                  paddingTop: "100px",
                  paddingBottom: "36px",
                  paddingLeft: "28px",
                  paddingRight: "28px",
                  minHeight: "320px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-end",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "absolute",
                      top: "-60px",
                      left: "50%",
                      transform: "translateX(-50%)",
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
                          gap: "10px",
                        }}
                      >
                        <div style={{ color: t.primary }}>{cur.mockupIcon}</div>
                        <p style={{ fontSize: "11px", color: t.muted }}>
                          Screenshot real aqui
                        </p>
                      </div>
                    </PhoneMockup>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ── Recursos Principais (3 cards, no tabs) ────────────────────────────────────

const FEATURES = [
  {
    id: "scan",
    badge: "IA Avançada",
    title: "Scan Inteligente e Super Preciso",
    desc: "Aponte a câmera e o Mint Foil identifica a carta instantaneamente: nome, set, edição e raridade.",
    icon: <ScanLine size={26} />,
  },
  {
    id: "precos",
    badge: "Exclusivo Brasil",
    title: "Preço Real e Monitoramento de Valor",
    desc: "Puxa preços da Liga Pokémon, myP Cards e outros marketplaces BR. Gráficos para saber quando comprar ou vender.",
    icon: <TrendingUp size={26} />,
  },
  {
    id: "portfolio",
    badge: "Controle Total",
    title: "Organização por Portfólios e Decks",
    desc: "Organize por jogo, crie decks, separe por coleção e acesse de qualquer lugar, no celular ou no PC.",
    icon: <BarChart3 size={26} />,
  },
];

function Resources() {
  const t = useTheme();
  return (
    <AltSection id="recursos">
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <STitle
          badge="Recursos Principais"
          title="Ferramentas que nenhum outro app tem"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: "20px",
          }}
        >
          {FEATURES.map((f, i) => (
            <FadeIn key={f.id} delay={i * 0.1}>
              <div style={{ position: "relative", paddingTop: "70px" }}>
                {/* Bleeding mockup */}
                <div
                  style={{
                    position: "absolute",
                    top: "-30px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 2,
                  }}
                >
                  <PhoneMockup size="sm">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        gap: "8px",
                        padding: "12px",
                      }}
                    >
                      <div style={{ color: t.primary }}>{f.icon}</div>
                      <p
                        style={{
                          fontSize: "9px",
                          color: t.muted,
                          textAlign: "center",
                        }}
                      >
                        Screenshot real aqui
                      </p>
                    </div>
                  </PhoneMockup>
                </div>

                {/* Card body */}
                <div
                  style={{
                    background: t.cardBg,
                    border: `1px solid ${t.border}`,
                    borderRadius: "20px",
                    padding: "100px 24px 28px",
                    minHeight: "260px",
                  }}
                >
                  <PinkBadge>{f.badge}</PinkBadge>
                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: 700,
                      color: t.text,
                      lineHeight: 1.25,
                      margin: "14px 0 10px",
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "13.5px",
                      color: t.muted,
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {f.desc}
                  </p>
                  <div style={{ marginTop: "20px" }}>
                    <PrimaryBtn small>
                      <ArrowRight size={13} /> Saiba mais
                    </PrimaryBtn>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </AltSection>
  );
}

// ── Integrations ──────────────────────────────────────────────────────────────

const SUPPORTED_TCGS = [
  {
    id: "pokemon",
    name: "Pokémon TCG",
    desc: "Scarlet & Violet, Sword & Shield e séries anteriores",
    color: "#FFCB05",
    textColor: "#92700a",
  },
  {
    id: "magic",
    name: "Magic: The Gathering",
    desc: "Cartas vintage, modernas e de Commander",
    color: "#A855F7",
    textColor: "#7e22ce",
  },
  {
    id: "yugioh",
    name: "Yu-Gi-Oh!",
    desc: "OCG, TCG e Master Duel",
    color: "#EF4444",
    textColor: "#b91c1c",
  },
  {
    id: "onepiece",
    name: "One Piece TCG",
    desc: "Todas as séries da Bandai",
    color: "#F97316",
    textColor: "#c2410c",
  },
];

const PRICE_SOURCES = [
  { id: "liga", name: "Liga Pokémon BR", status: "ativo" as const },
  { id: "myp", name: "myP Cards", status: "ativo" as const },
  { id: "ml", name: "Mercado Livre", status: "breve" as const },
  { id: "shopee", name: "Shopee", status: "breve" as const },
  { id: "fb", name: "Facebook Marketplace", status: "breve" as const },
];

const COMING_SOON_TCGS = [
  { id: "dragonball", name: "Dragon Ball Super TCG" },
  { id: "digimon", name: "Digimon Card Game" },
  { id: "lorcana", name: "Disney Lorcana" },
];

function Integrations() {
  const t = useTheme();
  return (
    <AltSection id="integracoes">
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <STitle
          badge="Compatibilidade"
          title="4 jogos. Preços do Brasil."
          sub="Identificação e preços reais de todas as grandes ligas e marketplaces brasileiros — sem depender de plataformas gringas."
        />

        {/* TCG cards 2×2 grid */}
        <FadeIn>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "16px",
              marginBottom: "40px",
            }}
          >
            {SUPPORTED_TCGS.map((tcg) => (
              <div
                key={tcg.id}
                style={{
                  background: t.cardBg,
                  border: `1px solid ${t.border}`,
                  borderRadius: "16px",
                  padding: "24px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* color bar top */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: tcg.color,
                    borderRadius: "16px 16px 0 0",
                  }}
                />
                {/* dot */}
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: tcg.color,
                    marginBottom: "14px",
                  }}
                />
                <p
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: t.text,
                    margin: "0 0 6px",
                  }}
                >
                  {tcg.name}
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: t.muted,
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {tcg.desc}
                </p>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "14px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: tcg.color,
                    background: `${tcg.color}18`,
                    padding: "3px 10px",
                    borderRadius: "20px",
                  }}
                >
                  Ativo
                </span>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Price sources strip */}
        <FadeIn delay={0.1}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: t.muted,
              marginBottom: "14px",
              textAlign: "center",
            }}
          >
            Fontes de preço
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "40px",
            }}
          >
            {PRICE_SOURCES.map((src) => {
              const isAtivo = src.status === "ativo";
              return (
                <div
                  key={src.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    borderRadius: "24px",
                    background: t.cardBg,
                    border: `1px solid ${t.border}`,
                    opacity: isAtivo ? 1 : 0.55,
                  }}
                >
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: isAtivo ? "#16a34a" : t.muted,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: isAtivo ? t.textBody : t.muted,
                    }}
                  >
                    {src.name}
                  </span>
                  {!isAtivo && (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        color: t.muted,
                        background: t.border,
                        padding: "1px 6px",
                        borderRadius: "8px",
                      }}
                    >
                      em breve
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </FadeIn>

        {/* Coming soon TCGs */}
        <FadeIn delay={0.2}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: t.muted,
              marginBottom: "14px",
              textAlign: "center",
            }}
          >
            Próximos jogos
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {COMING_SOON_TCGS.map((tcg) => (
              <div
                key={tcg.id}
                style={{
                  padding: "10px 18px",
                  borderRadius: "24px",
                  background: t.cardBg,
                  border: `1px dashed ${t.border}`,
                  fontSize: "13px",
                  fontWeight: 500,
                  color: t.muted,
                  opacity: 0.6,
                }}
              >
                {tcg.name}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </AltSection>
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
  const t = useTheme();
  return (
    <AltSection id="planos">
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
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
                background: t.cardBg,
                border: `1px solid ${t.border}`,
                height: "100%",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: t.muted,
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
                  color: t.text,
                  margin: "0 0 4px",
                }}
              >
                R$ 0
              </p>
              <p
                style={{ fontSize: "13px", color: t.muted, margin: "0 0 24px" }}
              >
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
                  <Check size={14} color={t.primary} />
                  <span style={{ fontSize: "13.5px", color: t.textBody }}>
                    {f}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: "20px" }}>
                <PrimaryBtn ghost full>
                  Começar grátis
                </PrimaryBtn>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div
              style={{
                padding: "32px 28px",
                borderRadius: "18px",
                background: t.primaryBg,
                border: `1px solid ${t.primaryBorder}`,
                position: "relative",
                height: "100%",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  background: t.primary,
                  color: "#FFFFFF",
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
                  color: t.primary,
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
                <span
                  style={{ fontSize: "32px", fontWeight: 800, color: t.text }}
                >
                  R$ 19,90
                </span>
                <span style={{ fontSize: "13px", color: t.muted }}>/mês</span>
              </div>
              <p
                style={{ fontSize: "13px", color: t.muted, margin: "0 0 24px" }}
              >
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
                  <Check size={14} color={t.primary} />
                  <span style={{ fontSize: "13.5px", color: t.textBody }}>
                    {f}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: "20px" }}>
                <PrimaryBtn full>
                  <ArrowRight size={14} /> Assinar PRO
                </PrimaryBtn>
              </div>
            </div>
          </FadeIn>
        </div>
        <FadeIn delay={0.2}>
          <p
            style={{
              textAlign: "center",
              fontSize: "13px",
              color: t.muted,
              marginTop: "28px",
              maxWidth: "440px",
              margin: "28px auto 0",
              lineHeight: 1.6,
            }}
          >
            Cancele quando quiser. Basta encontrar{" "}
            <strong style={{ color: t.primary }}>UMA</strong> carta que vale
            mais do que pensava.
          </p>
        </FadeIn>
      </div>
    </AltSection>
  );
}

// ── FAQ — custom visual redesign ──────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    id: "jogos",
    q: "Quais jogos posso escanear?",
    a: "Pokémon, Magic: The Gathering, Yu-Gi-Oh! e One Piece. Novos jogos chegam primeiro para usuários PRO.",
  },
  {
    id: "conta",
    q: "Preciso criar uma conta para usar?",
    a: "Não. Você usa 30 scans por dia sem login. Para portfólio e histórico, recomendamos criar uma conta gratuita.",
  },
  {
    id: "precos",
    q: "Como os preços são calculados?",
    a: "Coletamos dados diretamente das ligas e marketplaces brasileiros. Sem conversão de dólar.",
  },
  {
    id: "plataformas",
    q: "Funciona no celular e também no computador?",
    a: "Sim. App com scan disponível para iOS e Android. Versão web completa em qualquer browser.",
  },
  {
    id: "gratis",
    q: "O que o plano gratuito inclui?",
    a: "30 scans por dia, portfólio básico e preços das ligas BR. Sem cartão de crédito.",
  },
  {
    id: "cancelar",
    q: "Posso cancelar o PRO quando quiser?",
    a: "Sim, sem multa, a qualquer momento. Acesso PRO fica ativo até o fim do período pago.",
  },
  {
    id: "loja",
    q: "O Mint Foil funciona para lojas e revendedores?",
    a: "Sim. Scan em volume, estoque digital e preços BR em escala são ideais para lojistas.",
  },
];

function FAQSection() {
  const t = useTheme();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id="faq" style={{ padding: "100px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <STitle badge="FAQ" title="Perguntas frequentes" />
        <div
          style={{
            maxWidth: "680px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {FAQ_ITEMS.map((item, i) => (
            <FadeIn key={item.id} delay={i * 0.04}>
              <div
                style={{
                  borderRadius: "14px",
                  background: t.cardBg,
                  border: `1px solid ${open === item.id ? t.primaryBorder : t.border}`,
                  overflow: "hidden",
                  transition: "border-color 0.25s",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(open === item.id ? null : item.id)}
                  style={{
                    width: "100%",
                    padding: "18px 22px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        background: t.primaryBg,
                        border: `1px solid ${t.primaryBorder}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: t.primary,
                        fontSize: "13px",
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      ?
                    </div>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: t.text,
                        textAlign: "left",
                      }}
                    >
                      {item.q}
                    </span>
                  </div>
                  <span
                    style={{
                      color: t.primary,
                      fontSize: "20px",
                      fontWeight: 300,
                      transition: "transform 0.28s ease",
                      transform: open === item.id ? "rotate(45deg)" : "none",
                      marginLeft: "12px",
                      flexShrink: 0,
                      lineHeight: 1,
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  style={{
                    maxHeight: open === item.id ? "200px" : "0",
                    overflow: "hidden",
                    transition: "max-height 0.35s ease",
                  }}
                >
                  <p
                    style={{
                      padding: "0 22px 18px 62px",
                      fontSize: "13.5px",
                      color: t.muted,
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {item.a}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

const SOCIAL_LINKS = [
  { id: "instagram", icon: <Instagram size={18} />, label: "Instagram" },
  { id: "youtube", icon: <Youtube size={18} />, label: "YouTube" },
  { id: "twitter", icon: <Twitter size={18} />, label: "X / Twitter" },
];

function FooterSection() {
  const auroraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = auroraRef.current;
    if (!el) return;
    const tw = gsap.to(el, {
      scale: 1.14,
      opacity: 0.14,
      duration: 8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    return () => {
      tw.kill();
    };
  }, []);

  return (
    <footer
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "100px 24px 40px",
        background: "#020617",
        color: "#FFFFFF",
      }}
    >
      {/* GSAP aurora */}
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
            "radial-gradient(circle, rgba(248,86,167,0.12) 0%, transparent 70%)",
          filter: "blur(80px)",
          opacity: 0.08,
          pointerEvents: "none",
        }}
      />

      {/* Background text */}
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
            "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 60%)",
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
            {FOOTER_BAND.map(({ text, id }) => (
              <span
                key={id}
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: text === "✦" ? "#F856A7" : "rgba(255,255,255,0.4)",
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
          maxWidth: "640px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(32px, 7vw, 64px)",
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: "-2px",
            marginBottom: "36px",
          }}
        >
          Pronto pra começar?
        </h2>

        {/* Explorar Agora */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <PrimaryBtn dark>
            <ArrowRight size={16} /> Explorar Agora
          </PrimaryBtn>
        </div>

        {/* Download badges */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "32px",
          }}
        >
          <StoreBadge store="ios" />
          <StoreBadge store="android" />
        </div>

        {/* Social icons — separated below badges */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginTop: "48px",
            marginBottom: "60px",
          }}
        >
          {SOCIAL_LINKS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-label={s.label}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(255,255,255,0.5)",
                transition: "color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#FFFFFF";
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
            >
              {s.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom bar — copyright + links + scroll-to-top */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          maxWidth: "900px",
          margin: "0 auto",
          paddingTop: "24px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Left: copyright */}
        <p
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.3)",
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          © 2025 Mint Foil · São Paulo, Brasil
        </p>

        {/* Center: nav links */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {["Privacidade", "Termos", "Suporte", "Loja"].map((lbl) => (
            <button
              key={lbl}
              type="button"
              style={{
                background: "none",
                border: "none",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
                cursor: "pointer",
                transition: "color 0.2s",
                padding: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.3)";
              }}
            >
              {lbl}
            </button>
          ))}
        </div>

        {/* Right: scroll to top */}
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
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#FFFFFF";
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
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? DARK : LIGHT;

  const handleThemeToggle = (
    btnRef: React.RefObject<HTMLButtonElement | null>,
  ) => {
    const btn = btnRef.current;
    if (!btn) {
      setIsDark((d) => !d);
      return;
    }

    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const newDark = !isDark;

    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "99999",
      background: newDark ? "#020617" : "#FFFFFF",
      clipPath: `circle(0px at ${x}px ${y}px)`,
      transition: "clip-path 0.55s ease-in-out",
      pointerEvents: "none",
    });
    document.body.appendChild(overlay);
    // Force reflow
    void overlay.offsetWidth;
    overlay.style.clipPath = `circle(200% at ${x}px ${y}px)`;

    setTimeout(() => setIsDark(newDark), 240);
    setTimeout(() => overlay.remove(), 620);
  };

  return (
    <ThemeCtx.Provider value={theme}>
      <div
        style={{
          background: theme.bg,
          color: theme.text,
          minHeight: "100vh",
          overflowX: "hidden",
          transition: "background 0.1s",
        }}
      >
        <Nav isDark={isDark} onToggle={handleThemeToggle} />
        <Hero />
        <CinematicHero isDark={isDark} />
        <VideoSection />
        <RevealSection />
        <Pain />
        <Benefits />
        <Resources />
        <Integrations />
        <Pricing />
        <FAQSection />
        <FooterSection />
      </div>
    </ThemeCtx.Provider>
  );
}
