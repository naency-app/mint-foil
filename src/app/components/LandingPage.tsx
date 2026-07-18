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
  Instagram,
  Menu,
  Moon,
  Play,
  ScanLine,
  Share2,
  Star,
  Sun,
  TrendingUp,
  Twitter,
  Wallet,
  X,
  Youtube,
} from "lucide-react";
import {
  type MotionValue,
  motion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { Badge } from "@/components/ui/badge";
import { CinematicHero } from "@/components/ui/cinematic-landing-hero";
import ScrollMorphSection from "@/components/ui/scroll-morph-section";
import { StackedCardsInteraction } from "@/components/ui/stacked-cards-interaction";

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
  primary: "#F856A7",
  text: "#020617",
  textBody: "#4a4a68",
  muted: "rgba(0,0,0,0.45)",
  border: "rgba(0,0,0,0.08)",
  primaryBorder: "rgba(248,86,167,0.2)",
  primaryBg: "rgba(248,86,167,0.07)",
  cardBg: "#FFFFFF",
  isDark: false,
};

const DARK: Theme = {
  bg: "#020617",
  bgAlt: "#021937",
  primary: "#B50D57",
  text: "#FFFFFF",
  textBody: "rgba(255,255,255,0.82)",
  muted: "rgba(255,255,255,0.48)",
  border: "rgba(255,255,255,0.1)",
  primaryBorder: "rgba(181,13,87,0.22)",
  primaryBg: "rgba(181,13,87,0.07)",
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

// ── Responsive hook (from develop's landing) ──────────────────────────────────

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

// ── Card data — 30-card marquee (no repeats, mixed TCGs) ──────────────────────

const MARQUEE_SRCS = [
  // Pokémon 12
  "https://images.pokemontcg.io/swsh7/215_hires.png",
  // Umbreon ex — Prismatic Evolutions (2025)
  "https://images.pokemontcg.io/sv8pt5/161_hires.png",
  "https://images.pokemontcg.io/swsh4/188_hires.png",
  "https://images.pokemontcg.io/swsh8/271_hires.png",
  "https://images.pokemontcg.io/swsh7/218_hires.png",
  "https://images.pokemontcg.io/pgo/31_hires.png",
  "https://images.pokemontcg.io/swsh11/131_hires.png",
  "https://images.pokemontcg.io/swsh8/270_hires.png",
  "https://images.pokemontcg.io/swsh7/212_hires.png",
  "https://images.pokemontcg.io/swsh45sv/SV107_hires.png",
  // Pikachu ex — Surging Sparks (2024)
  "https://images.pokemontcg.io/sv8/238_hires.png",
  // Leafeon ex — Prismatic Evolutions (2025)
  "https://images.pokemontcg.io/sv8pt5/144_hires.png",
  // Yu-Gi-Oh! 8
  "https://images.ygoprodeck.com/images/cards/89631139.jpg",
  "https://images.ygoprodeck.com/images/cards/46986414.jpg",
  "https://images.ygoprodeck.com/images/cards/33396948.jpg",
  "https://images.ygoprodeck.com/images/cards/74677422.jpg",
  "https://images.ygoprodeck.com/images/cards/38033121.jpg",
  "https://images.ygoprodeck.com/images/cards/44508094.jpg",
  // Snake-Eye Ash — meta atual
  "https://images.ygoprodeck.com/images/cards/9674034.jpg",
  // Fiendsmith Engraver — chase de 2024/25
  "https://images.ygoprodeck.com/images/cards/60764609.jpg",
  // Magic 5
  // Sheoldred, the Apocalypse — staple atual
  "https://cards.scryfall.io/large/front/d/6/d67be074-cdd4-41d9-ac89-0a0456c4e4b2.jpg?1783921327",
  "https://cards.scryfall.io/large/front/4/c/4cbc6901-6a4a-4d0a-83ea-7eefa3b35021.jpg",
  "https://cards.scryfall.io/large/front/e/3/e3285e6b-3e79-4d7c-bf96-d920f973b122.jpg",
  "https://cards.scryfall.io/large/front/c/8/c8817585-0d32-4d56-9142-0d29512e86a9.jpg",
  "https://cards.scryfall.io/large/front/e/6/e653437e-2e56-4443-aec5-5bb7d8860238.jpg",
  // One Piece 5 — CDN da Limitless (o site oficial da Bandai bloqueia
  // hotlink via Cross-Origin-Resource-Policy)
  // Shanks SEC (OP01)
  "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP01/OP01-120_EN.webp",
  // Monkey.D.Luffy SEC — Gear 5 (OP05)
  "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP05/OP05-119_EN.webp",
  // Yamato SEC (OP01)
  "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP01/OP01-121_EN.webp",
  // Edward.Newgate SEC (OP02)
  "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP02/OP02-120_EN.webp",
  // Roronoa Zoro SR (OP01)
  "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP01/OP01-025_EN.webp",
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
  "Preços em Reais",
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
const REVEAL_ITEMS: { text: string; imgs: string[]; soon?: boolean }[] = [
  {
    text: "Pokémon",
    imgs: [
      "/landing/pkm-card-back.jpg",
      "https://images.pokemontcg.io/swsh7/215_hires.png",
    ],
  },
  {
    text: "Yu-Gi-Oh!",
    imgs: ["/landing/ygo-card-back.jpg", "/landing/blue-eyes-card.jpg"],
  },
  {
    text: "Magic",
    imgs: ["/landing/mtg-card-back.jpg", "/landing/shivan-card.jpg"],
  },
  {
    text: "One Piece",
    imgs: ["/landing/op-card-back.jpg", "/landing/luffy-card.png"],
  },
  {
    text: "Dragon Ball",
    imgs: [
      "/landing/ygo-card-back.jpg",
      "https://images.ygoprodeck.com/images/cards/44508094.jpg",
    ],
    soon: true,
  },
  {
    text: "Digimon",
    imgs: [
      "/landing/pkm-card-back.jpg",
      "https://images.pokemontcg.io/swsh8/271_hires.png",
    ],
    soon: true,
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
  // Ghost precisa de contraste com o fundo: rosa vivo no escuro, rosa da
  // marca no claro — texto branco fixo sumia no fundo branco
  const ghostColor = dark || t.isDark ? "#F856A7" : t.primary;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: small ? "8px 18px" : "13px 28px",
        borderRadius: "999px",
        border: ghost ? `1px solid ${ghostColor}80` : "none",
        // Ghost com vidro: continua legível quando as cartas do marquee
        // passam por baixo
        background: ghost ? "var(--mf-ghost-bg, rgba(255,255,255,0.35))" : GRAD,
        backdropFilter: ghost ? "blur(10px)" : undefined,
        WebkitBackdropFilter: ghost ? "blur(10px)" : undefined,
        color: ghost ? ghostColor : "#FFFFFF",
        fontSize: small ? "13px" : "14px",
        fontWeight: 600,
        cursor: "pointer",
        width: full ? "100%" : "auto",
        boxShadow: ghost ? "none" : "0 4px 16px rgba(248,86,167,0.35)",
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.18s ease",
        letterSpacing: "0.15px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        if (!ghost)
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(248,86,167,0.45)";
        else e.currentTarget.style.opacity = "0.85";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        if (!ghost)
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(248,86,167,0.35)";
        else e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
}

// Gradient CTA (from develop's landing) — theme-aware ghost variant
const GRAD = "linear-gradient(135deg, #F856A7 0%, #B50D57 100%)";

// Official-style App Store / Google Play badge
function StoreBadge({
  store,
  light = false,
  brand = false,
}: {
  store: "ios" | "android";
  // Variante do footer: vidro branco translúcido (tom da marca d'água
  // MINT FOIL) com fonte branca
  light?: boolean;
  // Variante de destaque: gradiente rosa da marca com fonte branca
  brand?: boolean;
}) {
  const isIos = store === "ios";
  // brand: branco com fonte/ícone rosa — destaque limpo sobre o card escuro
  const fg = brand ? "#F856A7" : "#FFFFFF";
  return (
    <button
      type="button"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 18px",
        borderRadius: "12px",
        background: brand
          ? "#FFFFFF"
          : light
            ? "rgba(255,255,255,0.06)"
            : "#000000",
        border: brand
          ? "1px solid rgba(255,255,255,0.4)"
          : light
            ? "1px solid rgba(255,255,255,0.12)"
            : "1px solid rgba(255,255,255,0.15)",
        boxShadow: brand ? "0 8px 24px rgba(0,0,0,0.35)" : "none",
        cursor: "pointer",
        transition: "opacity 0.18s, background 0.2s, transform 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (brand) e.currentTarget.style.transform = "translateY(-2px)";
        else if (light)
          e.currentTarget.style.background = "rgba(255,255,255,0.12)";
        else e.currentTarget.style.opacity = "0.82";
      }}
      onMouseLeave={(e) => {
        if (brand) e.currentTarget.style.transform = "translateY(0)";
        else if (light)
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        else e.currentTarget.style.opacity = "1";
      }}
    >
      {isIos ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={fg}
          aria-hidden="true"
        >
          <path d="M14.94 5.19A4.38 4.38 0 0 0 16 2a4.44 4.44 0 0 0-3 1.52 4.17 4.17 0 0 0-1 3.09 3.69 3.69 0 0 0 2.94-1.42zm2.52 7.44a4.51 4.51 0 0 1 2.16-3.81 4.66 4.66 0 0 0-3.66-2c-1.56-.16-3 .91-3.83.91-.83 0-2-.89-3.3-.87a4.92 4.92 0 0 0-4.14 2.53C2.89 12.03 4.1 17 5.86 19.47c.93 1.21 2 2.55 3.41 2.5 1.41-.05 1.91-.86 3.59-.86 1.68 0 2.16.86 3.61.83 1.45-.03 2.39-1.24 3.32-2.45a10.94 10.94 0 0 0 1.49-2.83 4.39 4.39 0 0 1-2.82-4.03z" />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={fg}
          aria-hidden="true"
        >
          <path d="M3.18 23.76a2 2 0 0 0 2.74.75L17 17.84l-3.4-3.4zM22 10.46a2 2 0 0 0 0-3.46L19.15 5.4 15.42 9l3.73 3.73zM1.25 1.5A2 2 0 0 0 1 2.5v19a2 2 0 0 0 .25 1L13 11zM17 6.16 5.92.49A2 2 0 0 0 3.18.25L13.6 11z" />
        </svg>
      )}
      <div style={{ textAlign: "left" }}>
        <div
          style={{
            fontSize: "9px",
            color: brand ? "rgba(248,86,167,0.75)" : "rgba(255,255,255,0.7)",
            lineHeight: 1.2,
          }}
        >
          {isIos ? "Download on the" : "Get it on"}
        </div>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: fg,
            lineHeight: 1.2,
          }}
        >
          {isIos ? "App Store" : "Google Play"}
        </div>
      </div>
    </button>
  );
}

function PinkBadge({
  children,
  small = false,
  color,
}: {
  children: ReactNode;
  small?: boolean;
  // Força um rosa específico (ex.: #F856A7 em seção de fundo branco no dark)
  color?: string;
}) {
  const t = useTheme();
  return (
    <Badge
      variant="outline"
      className={
        small
          ? "rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
          : "rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-widest"
      }
      style={{
        background: color ? `${color}12` : t.primaryBg,
        color: color ?? t.primary,
        borderColor: color ? `${color}33` : t.primaryBorder,
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

// ── Nav ───────────────────────────────────────────────────────────────────────

// Mesma ordem das seções na página: Como funciona → Coleções → Planos
const NAV_LINKS = [
  { label: "Como funciona", href: "#recursos" },
  { label: "Coleções", href: "#colecoes" },
  { label: "Planos", href: "#planos" },
  { label: "Loja", href: "/loja" },
];

function Nav({
  isDark,
  onToggle,
}: {
  isDark: boolean;
  onToggle: (ref: React.RefObject<HTMLButtonElement | null>) => void;
}) {
  const t = useTheme();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  // Menu mobile (hambúrguer)
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Loop de rAF contínuo (não só no scroll: as animações pinadas via GSAP
  // continuam movendo o fundo entre eventos). elementsFromPoint pega o que
  // está LITERALMENTE atrás da nav — zero atraso espacial.
  useEffect(() => {
    let raf = 0;
    const sampleBehind = () => {
      raf = requestAnimationFrame(sampleBehind);
      const stack = document.elementsFromPoint(window.innerWidth / 2, 30);
      let node: Element | null =
        stack.find((n) => !n.closest("nav") && !n.closest("[data-nav-skip]")) ??
        null;
      // Escreve direto nas CSS vars (nada de estado React): a nav pinta
      // certa desde o primeiro frame (script pré-paint dá o valor inicial)
      const apply = (dark: boolean, rgb: string) => {
        const root = document.documentElement.style;
        root.setProperty("--mf-nav-fg", dark ? "#FFFFFF" : "#020617");
        root.setProperty(
          "--mf-nav-muted",
          dark ? "rgba(255,255,255,0.55)" : "rgba(2,6,23,0.5)",
        );
        root.setProperty(
          "--mf-nav-border",
          dark ? "rgba(255,255,255,0.12)" : "rgba(2,6,23,0.08)",
        );
        root.setProperty(
          "--mf-nav-pill",
          dark ? "rgba(255,255,255,0.10)" : "rgba(2,6,23,0.06)",
        );
        root.setProperty("--mf-nav-rgb", rgb);
      };
      while (node) {
        const c = getComputedStyle(node).backgroundColor.match(/[\d.]+/g);
        if (c && c.length >= 3 && (c.length < 4 || Number(c[3]) > 0.5)) {
          // Só aceita fundo de blocos GRANDES (seções, cards de tela,
          // banner PRO): botão/badge/chip atrás da nav não tinge a pill
          const r = node.getBoundingClientRect();
          if (
            r.width >= window.innerWidth * 0.7 ||
            (r.width >= 500 && r.height >= 240)
          ) {
            const lum =
              0.2126 * Number(c[0]) +
              0.7152 * Number(c[1]) +
              0.0722 * Number(c[2]);
            apply(lum < 115, `${c[0]},${c[1]},${c[2]}`);
            return;
          }
        }
        node = node.parentElement;
      }
      apply(isDark, isDark ? "2,6,23" : "255,255,255");
    };
    raf = requestAnimationFrame(sampleBehind);
    return () => cancelAnimationFrame(raf);
  }, [isDark]);

  // Paleta da navbar via CSS vars — amostradas por frame, pré-paint no load
  const navText = "var(--mf-nav-fg, #020617)";
  const navMuted = "var(--mf-nav-muted, rgba(2,6,23,0.5))";
  const navBorder = "var(--mf-nav-border, rgba(2,6,23,0.08))";
  // Pill de hover discreto — cinza claro em ambos os temas
  const pillBg = "var(--mf-nav-pill, rgba(2,6,23,0.06))";

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: scrolled ? "12px" : "0px",
          left: "50%",
          transform: "translateX(-50%)",
          width: scrolled
            ? isMobile
              ? "calc(100% - 16px)"
              : "min(880px, calc(100% - 32px))"
            : "100%",
          zIndex: 9999,
          // Parada (topo): maior pra leitura; reduzida (pill) mantém compacta
          padding: scrolled ? "5px 10px" : isMobile ? "12px 16px" : "16px 56px",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          // Tint translúcido da COR REAL atrás da nav (amostrada por frame):
          // a pill parece feita do próprio fundo, só desfocada
          background: scrolled
            ? "rgba(var(--mf-nav-rgb, 255,255,255), 0.5)"
            : "transparent",
          backdropFilter: scrolled ? "blur(18px) saturate(1.4)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px) saturate(1.4)" : "none",
          border: scrolled ? `1px solid ${navBorder}` : "1px solid transparent",
          borderRadius: scrolled ? "16px" : "0px",
          boxShadow: scrolled ? "0 8px 28px rgba(2,6,23,0.18)" : "none",
          transition:
            "top 0.35s ease, width 0.35s ease, padding 0.35s ease, background 0.15s ease, border-radius 0.35s ease, box-shadow 0.35s ease, border-color 0.15s ease",
        }}
      >
        {/* Logo — clique volta a página pro início */}
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            justifySelf: "start",
            paddingLeft: scrolled
              ? isMobile
                ? "2px"
                : "10px"
              : isMobile
                ? "0px"
                : "24px",
            transition: "padding 0.35s ease",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          {/* biome-ignore lint/performance/noImgElement: logo local pequeno, sem necessidade de next/image */}
          <img
            src="/landing/logo-m.png"
            alt="Mint Foil"
            width={32}
            height={32}
            style={{
              display: "block",
              width: scrolled ? "28px" : "32px",
              height: scrolled ? "28px" : "32px",
              transition: "width 0.35s ease, height 0.35s ease",
            }}
          />
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: keyframe estático do shimmer foil */}
          <style dangerouslySetInnerHTML={{ __html: FOIL_CSS }} />
          <span
            style={{
              // Mesma cara do "MINT FOIL" da dashboard do app: fonte do
              // sistema, peso 800, caixa alta, tracking largo (1.5/10 = 0.15em)
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
              fontSize: scrolled ? "15px" : "18px",
              fontWeight: 800,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: navText,
              transition: "color 0.15s ease, font-size 0.35s ease",
            }}
          >
            Mint{" "}
            <span
              style={{
                background: FOIL_PINK,
                backgroundSize: "200% 200%",
                animation: "mfFoilShift 7s linear infinite",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Foil
            </span>
          </span>
        </a>

        {/* Links centrais — pill cinza desliza entre eles no hover.
          No mobile não cabem: somem (âncoras seguem acessíveis rolando) */}
        <div
          style={{
            display: isMobile ? "none" : "flex",
            alignItems: "center",
            gap: "2px",
          }}
          onMouseLeave={() => setHovered(null)}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onMouseEnter={() => setHovered(l.href)}
              style={{
                position: "relative",
                padding: "8px 14px",
                fontSize: scrolled ? "13.5px" : "15.5px",
                fontWeight: 500,
                color: hovered === l.href ? navText : navMuted,
                textDecoration: "none",
                transition: "color 0.15s ease, font-size 0.35s ease",
                borderRadius: "999px",
              }}
            >
              {hovered === l.href && (
                <motion.span
                  layoutId="nav-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "999px",
                    background: pillBg,
                    zIndex: 0,
                  }}
                />
              )}
              <span style={{ position: "relative", zIndex: 1 }}>{l.label}</span>
            </a>
          ))}
        </div>

        {/* Direita */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            justifySelf: "end",
            paddingRight: scrolled
              ? isMobile
                ? "0px"
                : "6px"
              : isMobile
                ? "0px"
                : "24px",
            transition: "padding 0.35s ease",
          }}
        >
          {/* Dark/light toggle */}
          <button
            type="button"
            ref={toggleRef}
            onClick={() => onToggle(toggleRef)}
            style={{
              width: "30px",
              height: "30px",
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
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Hambúrguer (mobile) */}
          {isMobile && (
            <button
              type="button"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: t.primaryBg,
                border: `1px solid ${t.primaryBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: t.primary,
              }}
            >
              {menuOpen ? <X size={15} /> : <Menu size={15} />}
            </button>
          )}

          {!isMobile && (
            <PrimaryBtn
              small
              onClick={() => {
                window.location.href = "/explore";
              }}
            >
              <ArrowRight size={13} /> Explorar Agora
            </PrimaryBtn>
          )}
        </div>
      </nav>

      {/* Menu mobile — tela cheia sob a nav */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: t.isDark
              ? "rgba(2,6,23,0.97)"
              : "rgba(255,255,255,0.97)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            paddingTop: "96px",
            paddingLeft: "28px",
            paddingRight: "28px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: t.text,
                textDecoration: "none",
                padding: "14px 0",
                letterSpacing: "-0.5px",
              }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ marginTop: "28px" }}>
            <PrimaryBtn
              full
              onClick={() => {
                setMenuOpen(false);
                window.location.href = "/explore";
              }}
            >
              <ArrowRight size={16} /> Explorar Agora
            </PrimaryBtn>
          </div>
        </div>
      )}
    </>
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
        // Var pré-paint: o estado React nasce light e pintava o hero de
        // branco por um frame no reload em dark
        background: "var(--mf-bg, #FFFFFF)",
      }}
    >
      {/* Luz ambiente do hero (só no light): wash rosa suave descendo do
          topo da tela — sem formato de "orbe" no meio do conteúdo */}
      {!t.isDark && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(1500px, 140vw)",
            height: "72vh",
            background:
              "radial-gradient(ellipse 55% 68% at 50% 0%, rgba(248,86,167,0.34) 0%, rgba(248,86,167,0.12) 45%, transparent 72%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}

      {/* Stagger block */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        style={{
          maxWidth: "1100px",
          textAlign: "center",
          position: "relative",
          zIndex: 10,
          padding: "0 24px",
        }}
      >
        <motion.div variants={fadeUp}>
          {/* Vars pré-paint: sem flash de cor no reload em dark */}
          <span
            style={{
              display: "inline-block",
              padding: "2px 12px",
              borderRadius: "999px",
              fontSize: "10px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              background: "var(--mf-primary-bg, rgba(248,86,167,0.07))",
              border:
                "1px solid var(--mf-primary-border, rgba(248,86,167,0.2))",
              color: "var(--mf-primary, #F856A7)",
            }}
          >
            Lançamento 2026
          </span>
        </motion.div>

        {/* Taglines idênticos aos do CinematicHero: 96px, weight 700/800,
            tracking-tight/-tighter — com a mesma entrada (blur+subida e wipe) */}
        <div style={{ margin: "22px 0 0", position: "relative" }}>
          <motion.h1
            initial={{ opacity: 0, y: 50, scale: 0.88, filter: "blur(16px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            style={{
              fontSize: "clamp(36px, 8vw, 104px)",
              fontWeight: 700,
              color: "var(--mf-fg, #020617)",
              lineHeight: 1,
              letterSpacing: "-0.045em",
              whiteSpace: "nowrap",
              margin: 0,
            }}
          >
            Escaneie. Descubra.
          </motion.h1>
          <motion.h1
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 1.3, ease: [0.85, 0, 0.15, 1], delay: 0.9 }}
            style={{
              fontSize: "clamp(36px, 8vw, 104px)",
              fontWeight: 800,
              color: "var(--mf-primary, #F856A7)",
              lineHeight: 1.05,
              letterSpacing: "-0.065em",
              whiteSpace: "nowrap",
              margin: "8px 0 0",
            }}
          >
            Saiba o valor real.
          </motion.h1>
        </div>

        <motion.p
          variants={fadeUp}
          style={{
            fontSize: "clamp(15px, 2.2vw, 18px)",
            color: "var(--mf-body, #4a4a68)",
            maxWidth: "600px",
            margin: "22px auto 0",
            lineHeight: 1.7,
          }}
        >
          Identifique cartas de Pokémon, Magic, Yu-Gi-Oh! e One Piece e
          acompanhe o valor da sua coleção. Grátis pra começar.
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
            <PrimaryBtn
              onClick={() => {
                window.location.href = "/explore";
              }}
            >
              <ArrowRight size={16} /> Explorar Agora
            </PrimaryBtn>
            <PrimaryBtn
              ghost
              onClick={() =>
                document
                  .getElementById("recursos")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Play size={14} /> Ver como funciona
            </PrimaryBtn>
          </div>
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
                loading="lazy"
                decoding="async"
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

// SEM AltSection de propósito: no dark esta seção fica ESCURA (contínua com
// a animação que dá fade em cima dela) — a inversão pro branco era um tapa
// na cara logo depois do card escuro
function VideoSection() {
  const t = useTheme();
  // Pin igual ao tesouro: wrapper alto + seção sticky de 100vh. O scroll é
  // consumido DENTRO da seção alimentando a entrada do card do vídeo
  // (scale/y) — a tela fica travada nela até a animação terminar
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  // Um scroll completa a animação (até ~60% do pin), o seguinte libera
  const cardScale = useSpring(
    useTransform(scrollYProgress, [0, 0.6], [0.92, 1]),
    { stiffness: 90, damping: 24 },
  );
  const cardY = useSpring(useTransform(scrollYProgress, [0, 0.6], [40, 0]), {
    stiffness: 90,
    damping: 24,
  });

  return (
    // Pin curto (~2 scrolls) com a seção em TAMANHO NATURAL: sticky no topo,
    // sem flex/altura forçada — nada é redimensionado nunca
    <div ref={wrapRef} style={{ height: "165vh", position: "relative" }}>
      <section
        style={{
          position: "sticky",
          top: 0,
          minHeight: "100vh",
          padding: "120px 24px 80px",
          // Um passo mais claro que o bg da página no dark: marca a divisão
          // da seção sem inverter pro branco
          background: t.isDark ? "#070D1C" : t.bgAlt,
        }}
      >
        <VideoInner cardScale={cardScale} cardY={cardY} />
      </section>
    </div>
  );
}

// Tamanho natural no desktop; 92vw só limita no mobile (não transbordar)
const VIDEO_W = "min(960px, 92vw)";

function VideoInner({
  cardScale,
  cardY,
}: {
  cardScale: MotionValue<number>;
  cardY: MotionValue<number>;
}) {
  const t = useTheme();
  const isMobile = useIsMobile();
  const [hovered, setHovered] = useState(false);
  // Mesmo tratamento dos tiles da Solução no dark
  const accent = t.isDark ? "#F856A7" : t.primary;
  const cardBg = t.isDark ? "rgba(255,255,255,0.03)" : t.cardBg;
  const cardBorder = t.isDark ? "rgba(255,255,255,0.08)" : t.border;
  return (
    <>
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
        style={{ maxWidth: "1240px", margin: "0 auto", position: "relative" }}
      >
        {/* Cabeçalho na mesma coluna do card do vídeo */}
        <div
          style={{
            textAlign: "left",
            maxWidth: VIDEO_W,
            margin: "0 auto 36px",
          }}
        >
          <FadeIn>
            <p
              style={{
                fontSize: "18px",
                lineHeight: "20px",
                fontWeight: 500,
                // Label segue o rosa do tema (vinho no dark)
                color: t.primary,
                letterSpacing: "0.5px",
                margin: "0 0 12px",
              }}
            >
              Veja em ação
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2
              style={{
                fontSize: "clamp(24px, 4vw, 34px)",
                lineHeight: "clamp(32px, 5.5vw, 44px)",
                fontWeight: 700,
                color: t.text,
                margin: 0,
                maxWidth: "640px",
              }}
            >
              Conheça a interface do Mint Foil
            </h2>
          </FadeIn>
          <FadeIn delay={0.18}>
            <p
              style={{
                fontSize: "clamp(15px, 2.5vw, 18px)",
                lineHeight: "28px",
                color: t.muted,
                maxWidth: "520px",
                margin: "14px 0 0",
              }}
            >
              Navegue pela versão web e veja como funciona na prática.
            </p>
          </FadeIn>
        </div>
        {/* Entrada do card dirigida pelo scroll do pin (scale + subida) */}
        <motion.div style={{ scale: cardScale, y: cardY }}>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: hover decorativo na borda */}
          <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              width: "100%",
              // Mobile: formato de TELA DE CELULAR — estreito e em pé
              maxWidth: isMobile ? "min(300px, 78vw)" : VIDEO_W,
              margin: "0 auto",
              borderRadius: isMobile ? "24px" : "20px",
              overflow: "hidden",
              background: cardBg,
              // Mesma borda/hover dos tiles da Solução
              border: `1px solid ${hovered ? "#F856A755" : cardBorder}`,
              // Mobile: proporção de celular (vídeo gravado em pé)
              aspectRatio: isMobile ? "9 / 16" : "1024 / 534.945",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "border-color 0.3s ease",
              position: "relative",
            }}
          >
            {/* Banho de gradiente + glow de baixo: mesmo idioma da área de
                preview dos cards do "Como funciona" — sem isso o card era um
                buraco escuro no dark */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(248,86,167,0.10) 0%, rgba(181,13,87,0.06) 100%)",
                pointerEvents: "none",
              }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at 50% 115%, rgba(248,86,167,0.22) 0%, transparent 60%)",
                pointerEvents: "none",
              }}
            />
            {/* Marca d'água */}
            <span
              aria-hidden
              style={{
                position: "absolute",
                bottom: "4%",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "clamp(48px, 10vw, 120px)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                whiteSpace: "nowrap",
                color: t.isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(2,6,23,0.05)",
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              MINT FOIL
            </span>
            <div style={{ textAlign: "center", position: "relative" }}>
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: accent,
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
        </motion.div>
      </div>
    </>
  );
}

// ── Reveal hover ──────────────────────────────────────────────────────────────

function RevealItem({
  text,
  imgs,
  soon = false,
}: {
  text: string;
  imgs: string[];
  soon?: boolean;
}) {
  const t = useTheme();
  const [hoveredRaw, setHovered] = useState(false);
  // Jogos "em breve" ficam desativados: sem reveal, apagados
  const hovered = hoveredRaw && !soon;

  return (
    <div style={{ padding: "16px 0" }}>
      {/* Wrapper inline: as cartas ancoram no fim da palavra */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <button
          type="button"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          onClick={() => setHovered((h) => !h)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "default",
            textAlign: "left",
          }}
        >
          <h3
            style={{
              // Stack do sistema: a Circular Std só vai até 700, então o
              // 900 saía "falso" e fino — SF Pro/Segoe têm Black de verdade
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
              fontSize: "clamp(52px, 9.5vw, 96px)",
              fontWeight: 900,
              color: soon ? t.muted : t.text,
              textTransform: "uppercase",
              lineHeight: 1,
              transition: "opacity 0.4s",
              opacity: hovered ? 0.2 : soon ? 0.35 : 1,
              letterSpacing: "-2px",
            }}
          >
            {text}
            {soon && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  verticalAlign: "super",
                  marginLeft: "14px",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  border: `1px dashed ${t.muted}`,
                  color: t.muted,
                  whiteSpace: "nowrap",
                }}
              >
                EM BREVE
              </span>
            )}
          </h3>
        </button>

        {/* Card 1 (frente) — em cima da última letra */}
        <div
          style={{
            position: "absolute",
            right: "-16px",
            top: "-18px",
            zIndex: 40,
            width: "100px",
            height: "140px",
            transform: hovered ? "scale(1) rotate(-4deg)" : "scale(0)",
            opacity: hovered ? 1 : 0,
            transition: "all 0.45s cubic-bezier(0.34,1.56,0.64,1)",
            pointerEvents: "none",
          }}
        >
          {/* biome-ignore lint/performance/noImgElement: external TCG card URLs require referrerPolicy */}
          <img
            src={imgs[1]}
            alt=""
            decoding="async"
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

        {/* Card 2 (verso, atrás, rotacionado) */}
        <div
          style={{
            position: "absolute",
            right: "-16px",
            top: "-18px",
            zIndex: 39,
            width: "100px",
            height: "140px",
            transform: hovered
              ? "scale(1) translateX(50px) translateY(28px) rotate(12deg)"
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
            decoding="async"
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
    </div>
  );
}

function RevealSection() {
  const t = useTheme();
  const isMobile = useIsMobile();
  return (
    <section
      id="colecoes"
      style={{
        padding: isMobile ? "80px 20px" : "125px 24px",
        maxWidth: "1240px",
        margin: "0 auto",
      }}
    >
      {/* Bloco recuado pro centro, texto alinhado à esquerda — o cabeçalho
          nasce na mesma coluna das palavras, no estilo do "Veja em ação" */}
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <div style={{ textAlign: "left", marginBottom: "48px" }}>
          <FadeIn>
            <p
              style={{
                fontSize: "18px",
                lineHeight: "20px",
                fontWeight: 500,
                color: t.primary,
                letterSpacing: "0.5px",
                margin: "0 0 12px",
              }}
            >
              Coleções
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2
              style={{
                fontSize: "clamp(24px, 4vw, 34px)",
                lineHeight: "clamp(32px, 5.5vw, 44px)",
                fontWeight: 700,
                color: t.text,
                margin: 0,
                maxWidth: "640px",
              }}
            >
              Explore seus jogos favoritos
            </h2>
          </FadeIn>
          <FadeIn delay={0.18}>
            <p
              style={{
                fontSize: "13px",
                color: t.muted,
                margin: "12px 0 0",
              }}
            >
              ✦ {isMobile ? "toque nos nomes" : "passe o mouse nos nomes"}
            </p>
          </FadeIn>
        </div>
        {REVEAL_ITEMS.map(({ text, imgs, soon }) => (
          <RevealItem key={text} text={text} imgs={imgs} soon={soon} />
        ))}
      </div>
    </section>
  );
}

// ── Ferramentas (2×2 de recursos + stacked cards interativas) ─────────────────

function WatchDemoBtn() {
  const t = useTheme();
  // Discreto (borda/texto neutros) — SÓ o play é rosa
  const accent = t.isDark ? "#F856A7" : t.primary;
  const hoverBg = t.isDark ? "rgba(255,255,255,0.06)" : "rgba(2,6,23,0.04)";
  return (
    <button
      type="button"
      onClick={() =>
        document
          .getElementById("recursos")
          ?.scrollIntoView({ behavior: "smooth" })
      }
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 18px",
        borderRadius: "999px",
        border: `1px solid ${t.border}`,
        background: "transparent",
        color: t.text,
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.2s ease, border-color 0.2s ease",
        letterSpacing: "-0.1px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "rgba(248,86,167,0.14)",
          color: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Play size={9} />
      </div>
      Assistir o passo a passo
    </button>
  );
}

const STACK_CARDS = [
  // Pikachu VMAX (Vivid Voltage)
  {
    image: "https://images.pokemontcg.io/swsh4/188_hires.png",
    badge: "R$ 380",
  },
  // Incredible Ecclesia, the Virtuous (MP22-EN188 · Prismatic Secret Rare);
  // o foil só existe na carta física, o scan digital é o mesmo
  {
    image: "https://images.ygoprodeck.com/images/cards/55273560.jpg",
  },
  // Vivi Ornitier — Final Fantasy (2025), staple atual de Magic
  {
    image:
      "https://cards.scryfall.io/large/front/e/c/ecc1027a-8c07-44a0-bdde-fa2844cff694.jpg?1783906561",
  },
];

// Diferenciais — o que SÓ o Mint Foil tem (sem repetir as features da
// Solução e do carrossel)
const WHY_POINTS = [
  {
    id: "brasil",
    icon: <DollarSign size={17} />,
    title: "Feito pro Brasil",
    desc: "Valores em reais e links direto pras lojas brasileiras.",
  },
  {
    id: "multi",
    icon: <Gamepad2 size={17} />,
    title: "4 jogos, 1 app",
    desc: "Sem pular entre quatro sites pra cuidar da coleção.",
  },
  {
    id: "semconta",
    icon: <ScanLine size={17} />,
    title: "Comece sem conta",
    desc: "30 scans grátis por dia — sem cadastro, sem cartão.",
  },
  {
    id: "portfolio",
    icon: <TrendingUp size={17} />,
    title: "Coleção como portfólio",
    desc: "Valorização acompanhada dia a dia, como numa corretora.",
  },
];

function WhyInner({ isMobile }: { isMobile: boolean }) {
  const t = useTheme();
  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1.1fr 1fr",
        gap: isMobile ? "56px" : "72px",
        alignItems: "center",
      }}
    >
      {/* Texto — as ferramentas do app. Fundo aqui é branco (mesmo no dark),
          então o accent é sempre o rosa vivo */}
      <div>
        <FadeIn>
          <PinkBadge>Por que o Mint Foil</PinkBadge>
        </FadeIn>
        <FadeIn delay={0.08}>
          <h2
            style={{
              fontSize: "clamp(30px, 4.8vw, 48px)",
              fontWeight: 800,
              color: t.text,
              lineHeight: 1.08,
              margin: "18px 0 0",
              letterSpacing: "-1px",
            }}
          >
            Feito pro colecionador{" "}
            <span style={{ color: "#F856A7" }}>brasileiro.</span>
          </h2>
        </FadeIn>
        {/* Benefícios 2×2 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "14px",
            marginTop: "30px",
          }}
        >
          {WHY_POINTS.map((pt, i) => (
            <FadeIn key={pt.id} delay={0.18 + i * 0.06}>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(248,86,167,0.07)",
                    border: "1px solid rgba(248,86,167,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#F856A7",
                    flexShrink: 0,
                  }}
                >
                  {pt.icon}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "14.5px",
                      fontWeight: 700,
                      color: t.text,
                      margin: 0,
                    }}
                  >
                    {pt.title}
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: t.muted,
                      lineHeight: 1.5,
                      margin: "2px 0 0",
                    }}
                  >
                    {pt.desc}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Stacked cards interativas */}
      <FadeIn delay={0.2}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: "-30px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${t.primaryBg} 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <StackedCardsInteraction
              cards={STACK_CARDS}
              spreadDistance={isMobile ? 44 : 120}
              rotationAngle={10}
            />
            <p
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: t.muted,
                marginTop: "22px",
              }}
            >
              ✦ {isMobile ? "toque nas cartas" : "passe o mouse nas cartas"}
            </p>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

// Sem AltSection: no dark esta seção fica ESCURA (tom de divisão, como o
// "Veja em ação") em vez de inverter pro branco
function WhyMintFoil() {
  const t = useTheme();
  const isMobile = useIsMobile();
  return (
    <section
      style={{
        padding: isMobile ? "80px 20px" : "120px 24px",
        background: t.isDark ? "#070D1C" : t.bgAlt,
      }}
    >
      <WhyInner isMobile={isMobile} />
    </section>
  );
}

// ── Solução — passo a passo + invocação 3D ────────────────────────────────────

// Bento no estilo Collectr ("One app, the whole hobby"), em rosa:
// tile = ícone + título + desc + link-CTA; spans somam 12 por linha
const SOLUTION_STEPS = [
  {
    id: "scan",
    icon: <Camera size={22} />,
    title: "Escaneie",
    desc: "Aponte a câmera e a carta é identificada em segundos — Pokémon, Magic, Yu-Gi-Oh! ou One Piece.",
    cta: "Experimente o scan",
    href: "/scan",
    span: 7,
  },
  {
    id: "valor",
    icon: <DollarSign size={22} />,
    title: "Veja o valor",
    desc: "Valor de referência em reais na hora — e o link pra conferir nas lojas brasileiras.",
    cta: "Explore os preços",
    href: "/explore",
    span: 5,
  },
  {
    id: "portfolio",
    icon: <Wallet size={22} />,
    title: "Adicione ao portfólio",
    desc: "Coleção catalogada e monitorada dia a dia, com gráficos de valorização.",
    cta: "Monte o seu",
    href: "/portfolio",
    span: 5,
  },
  {
    id: "share",
    icon: <Share2 size={22} />,
    title: "Compartilhe",
    desc: "Mostre sua coleção pra quem quiser com um link só seu.",
    cta: "Mostre sua coleção",
    href: "/portfolio",
    span: 7,
  },
];

function SolutionSection() {
  const t = useTheme();
  const isMobile = useIsMobile();
  // Dark no estilo Collectr: tiles escuros neutros (vidro sutil sobre o bg)
  // com accent rosa VIVO — o vinho do tema some no fundo escuro
  const accent = t.isDark ? "#F856A7" : t.primary;
  const tileBg = t.isDark ? "rgba(255,255,255,0.03)" : t.cardBg;
  const tileBorder = t.isDark ? "rgba(255,255,255,0.08)" : t.border;
  const iconBg = t.isDark ? "rgba(248,86,167,0.10)" : t.primaryBg;
  const iconBorder = t.isDark ? "rgba(248,86,167,0.25)" : t.primaryBorder;
  return (
    <section
      id="como-funciona"
      style={{ padding: isMobile ? "80px 20px" : "110px 24px 90px" }}
    >
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        {/* Cabeçalho à esquerda + botão alinhado com a linha do label "A Solução" */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "24px",
            flexWrap: "wrap",
            marginBottom: "48px",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <FadeIn>
              <p
                style={{
                  fontSize: "18px",
                  lineHeight: "20px",
                  fontWeight: 500,
                  // Só o label usa o rosa do tema (vinho no dark); CTAs e
                  // ícones dos tiles seguem no rosa vivo pela legibilidade
                  color: t.primary,
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
                  fontSize: "clamp(24px, 4vw, 34px)",
                  lineHeight: "clamp(32px, 5.5vw, 44px)",
                  fontWeight: 700,
                  color: t.text,
                  margin: 0,
                  maxWidth: "640px",
                }}
              >
                Um app, o hobby inteiro
              </h2>
            </FadeIn>
            <FadeIn delay={0.18}>
              <p
                style={{
                  fontSize: "clamp(15px, 2.5vw, 18px)",
                  lineHeight: "28px",
                  color: t.muted,
                  maxWidth: "520px",
                  margin: "14px 0 0",
                }}
              >
                Sem planilha, sem pesquisar carta por carta na Liga. Quatro
                passos e pronto.
              </p>
            </FadeIn>
          </div>
          <FadeIn delay={0.2}>
            <WatchDemoBtn />
          </FadeIn>
        </div>

        {/* Bento estilo Collectr — tiles largos com glow de canto, spotlight
            no hover e link-CTA rosa */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(12, 1fr)",
            gap: "16px",
          }}
        >
          {SOLUTION_STEPS.map((s, i) => (
            <div
              key={s.id}
              style={{ gridColumn: isMobile ? "auto" : `span ${s.span}` }}
            >
              <FadeIn delay={i * 0.08} className="h-full">
                {/* biome-ignore lint/a11y/noStaticElementInteractions: hover decorativo na borda */}
                <div
                  style={{
                    position: "relative",
                    padding: "30px 28px",
                    borderRadius: "20px",
                    background: tileBg,
                    border: `1px solid ${tileBorder}`,
                    height: "100%",
                    minHeight: "210px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    transition: "border-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${accent}55`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = tileBorder;
                  }}
                >
                  {/* Só o primeiro tile: luz nascendo na borda esquerda e
                      irradiando pra direita (igual ao Collectr) */}
                  {i === 0 && (
                    <div
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: "-140px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "480px",
                        height: "300px",
                        background: `radial-gradient(ellipse at left center, rgba(248,86,167,${
                          t.isDark ? 0.28 : 0.18
                        }) 0%, rgba(248,86,167,${
                          t.isDark ? 0.1 : 0.06
                        }) 45%, transparent 75%)`,
                        filter: "blur(40px)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "14px",
                      background: iconBg,
                      border: `1px solid ${iconBorder}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: accent,
                      marginBottom: "20px",
                    }}
                  >
                    {s.icon}
                  </div>
                  <h4
                    style={{
                      fontSize: "20px",
                      lineHeight: "28px",
                      fontWeight: 700,
                      color: t.text,
                      margin: "0 0 8px",
                      letterSpacing: "-0.3px",
                    }}
                  >
                    {s.title}
                  </h4>
                  <p
                    style={{
                      fontSize: "14.5px",
                      lineHeight: "23px",
                      color: t.muted,
                      margin: 0,
                      flex: 1,
                      maxWidth: "420px",
                    }}
                  >
                    {s.desc}
                  </p>
                  <a
                    href={s.href}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      marginTop: "18px",
                      fontSize: "13.5px",
                      fontWeight: 700,
                      color: accent,
                      textDecoration: "none",
                      width: "fit-content",
                    }}
                  >
                    {s.cta}
                    <ArrowRight size={14} />
                  </a>
                </div>
              </FadeIn>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Key Features — carrossel (from develop) ───────────────────────────────────

// `video`: caminho do mockup em vídeo da tela real do app (ex.:
// "/landing/videos/scan.mp4") — enquanto vazio, mostra o placeholder
const FEATURE_TABS: {
  value: string;
  icon: ReactNode;
  label: string;
  desc: string;
  mockupIcon: ReactNode;
  video?: string;
}[] = [
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
    label: "Preços em Reais",
    desc: "Valor de referência convertido pra reais e atualizado todos os dias — com o link das lojas BR na tela da carta.",
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

const CARD_W = 600;
const CARD_GAP = 24;

function KeyFeatures() {
  const t = useTheme();
  // Sempre nasce no primeiro card; navegação é 100% manual (setas, dots,
  // arrasto) — sem autoplay
  const [activeIdx, setActiveIdx] = useState(0);
  const isMobile = useIsMobile();
  // Começa igual ao SSR (1280) e mede só pós-mount: ler window.innerWidth
  // no estado inicial quebrava a hidratação (paddingLeft divergente)
  const [winW, setWinW] = useState(1280);
  useEffect(() => {
    const onResize = () => setWinW(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const cardW = isMobile ? winW - 40 : CARD_W;
  // O trilho começa na MESMA linha do container do título (1240px centrado):
  // o primeiro card nasce alinhado com o cabeçalho, não solto na esquerda
  const stripPad = isMobile ? 20 : Math.max(24, (winW - 1240) / 2 + 24);

  const prev = () =>
    setActiveIdx((i) => (i - 1 + FEATURE_TABS.length) % FEATURE_TABS.length);
  const next = () => setActiveIdx((i) => (i + 1) % FEATURE_TABS.length);

  // Saiu da tela → volta pro primeiro card (o reset acontece fora da vista;
  // ao rolar de volta, o carrossel sempre recomeça do início)
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setActiveIdx(0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="recursos"
      style={{ padding: isMobile ? "80px 0" : "125px 0" }}
    >
      {/* ── Header — à esquerda, padrão da seção Solução ── */}
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: isMobile ? "0 20px 36px" : "0 24px 52px",
          textAlign: "left",
        }}
      >
        <FadeIn>
          <p
            style={{
              fontSize: "18px",
              lineHeight: "20px",
              fontWeight: 500,
              color: t.primary,
              letterSpacing: "0.5px",
              margin: "0 0 12px",
            }}
          >
            Como funciona
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2
            style={{
              fontSize: "clamp(24px, 4vw, 34px)",
              lineHeight: "clamp(32px, 5.5vw, 44px)",
              fontWeight: 700,
              color: t.text,
              margin: 0,
              maxWidth: "640px",
            }}
          >
            Cada recurso em ação, passo a passo
          </h2>
        </FadeIn>
        <FadeIn delay={0.18}>
          <p
            style={{
              fontSize: "clamp(15px, 2.5vw, 18px)",
              lineHeight: "28px",
              color: t.muted,
              maxWidth: "520px",
              margin: "14px 0 0",
            }}
          >
            Vídeos do app real mostrando como escanear, ver preços e montar seu
            portfólio.
          </p>
        </FadeIn>
      </div>

      {/* ── Carousel — full viewport width ── */}
      <div style={{ position: "relative", width: "100%" }}>
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
            background: t.cardBg,
            border: `1px solid ${t.border}`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            padding: 0,
          }}
        >
          <ChevronLeft size={18} color={t.text} />
        </button>

        {/* Cards strip */}
        <div style={{ overflow: "hidden" }}>
          <motion.div
            style={{
              display: "flex",
              gap: `${CARD_GAP}px`,
              paddingLeft: `${stripPad}px`,
            }}
            animate={{ x: -activeIdx * (cardW + CARD_GAP) }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            drag={isMobile ? "x" : false}
            dragConstraints={{
              left: -(FEATURE_TABS.length - 1) * (cardW + CARD_GAP),
              right: 0,
            }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) next();
              else if (info.offset.x > 50) prev();
            }}
          >
            {FEATURE_TABS.map((ft, i) => (
              // biome-ignore lint/a11y/noStaticElementInteractions: clicar num card vizinho navega até ele (como no tryoption.ai); dots/setas cobrem teclado
              // biome-ignore lint/a11y/useKeyWithClickEvents: navegação por teclado já existe nos dots e setas
              <div
                key={ft.value}
                onClick={() => setActiveIdx(i)}
                style={{
                  width: `${cardW}px`,
                  flexShrink: 0,
                  // No dark, mesma cor dos tiles da Solução (sem o azul navy)
                  background: t.isDark ? "rgba(255,255,255,0.03)" : t.cardBg,
                  border: `1px solid ${
                    t.isDark ? "rgba(255,255,255,0.08)" : t.border
                  }`,
                  borderRadius: "16px",
                  overflow: "hidden",
                  cursor: activeIdx === i ? "default" : "pointer",
                }}
              >
                {/* ── Video / preview area — quando o vídeo do app existir,
                    é só preencher ft.video que ele toca aqui ── */}
                <div
                  style={{
                    height: isMobile ? "200px" : "325px",
                    position: "relative",
                    background:
                      "linear-gradient(135deg, rgba(248,86,167,0.12) 0%, rgba(181,13,87,0.08) 100%)",
                    overflow: "hidden",
                  }}
                >
                  {ft.video && (
                    <video
                      src={ft.video}
                      autoPlay
                      muted
                      loop
                      playsInline
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        zIndex: 2,
                      }}
                    />
                  )}
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
                      transform: isMobile
                        ? "translateX(-50%) scale(0.4)"
                        : "translateX(-50%) scale(0.65)",
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
                        <div style={{ color: t.primary }}>{ft.mockupIcon}</div>
                      </div>
                    </PhoneMockup>
                  </div>
                </div>

                {/* ── Info area — icon + label + desc; mesmo bg dos tiles
                    da Solução ── */}
                <div
                  style={{
                    padding: "18px 20px 22px",
                    borderTop: `1px solid ${t.border}`,
                    background: t.isDark ? "rgba(255,255,255,0.03)" : t.cardBg,
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
                    <span style={{ color: t.muted, display: "flex" }}>
                      {ft.icon}
                    </span>
                    <p
                      style={{
                        fontSize: "20px",
                        lineHeight: "28px",
                        fontWeight: 500,
                        color: t.text,
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
                      color: t.muted,
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
            background: t.cardBg,
            border: `1px solid ${t.border}`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            padding: 0,
          }}
        >
          <ChevronRight size={18} color={t.text} />
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
        {FEATURE_TABS.map((ft, i) => (
          <button
            key={ft.value}
            type="button"
            aria-label={`Ir para ${ft.label}`}
            onClick={() => setActiveIdx(i)}
            style={{
              width: activeIdx === i ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: activeIdx === i ? t.primary : t.border,
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

// ── Pricing ───────────────────────────────────────────────────────────────────

const PRO_FEATURES = [
  "Scans ilimitados",
  "Portfólio completo",
  "Gráficos de valorização",
  "Histórico completo de preços",
  "Novos TCGs prioritários",
  "Suporte prioritário",
];

// ── Banner PRO — tratamento "foil" (holo de carta) no lugar do dourado
// do Collectr: mesma leitura de raridade/premium, mas literal ao nome
// Mint Foil e sem abandonar o rosa ─────────────────────────────────────────────

// Paleta foil: rosas da marca → roxo → azul → laranja → amarelo e VOLTA
// suave (laranja → rosa) até o vinho — sem quebra entre amarelo e rosa;
// pontas iguais pro loop ser contínuo
// Gradiente ESPELHADO: pico do amarelo em 50% e a volta refaz o caminho com
// o mesmo espaçamento da ida — a virada de volta pro rosa da marca é tão
// suave quanto a de ida (antes a volta era comprimida e criava linha)
const FOIL =
  "linear-gradient(110deg, #B50D57 0%, #C61F6B 4%, #D7327F 8%, #E74493 12%, #F856A7 16%, #FC7DC0 20%, #FF9AD5 24%, #E3A9E9 27%, #C49AFF 30%, #AEADFF 33%, #9AC1FF 36%, #C2CFF2 40%, #F2C9A9 44%, #FFB68A 47%, #FFE89A 50%, #FFB68A 53%, #F2C9A9 56%, #C2CFF2 60%, #9AC1FF 64%, #AEADFF 67%, #C49AFF 70%, #E3A9E9 73%, #FF9AD5 76%, #FC7DC0 80%, #F856A7 84%, #E74493 88%, #D7327F 92%, #C61F6B 96%, #B50D57 100%)";
// Variante só rosas → roxo → azul (sem laranja/amarelo) — usada no "Foil"
// do wordmark, onde os tons quentes destoavam
const FOIL_PINK =
  "linear-gradient(110deg, #B50D57 0%, #D7327F 6%, #F856A7 12%, #FC7DC0 19%, #FF9AD5 26%, #E3A9E9 33%, #C49AFF 40%, #AEADFF 45%, #9AC1FF 50%, #AEADFF 55%, #C49AFF 60%, #E3A9E9 67%, #FF9AD5 74%, #FC7DC0 81%, #F856A7 88%, #D7327F 94%, #B50D57 100%)";
const FOIL_CSS =
  "@keyframes mfFoilShift { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }";

function ProBanner() {
  const isMobile = useIsMobile();
  // Slider embutido: até 30 scans/dia = Grátis (R$ 0); acima = PRO 19,90.
  // Nasce em 31 (PRO): mexendo pra baixo a pessoa descobre que zera
  const [scans, setScans] = useState(31);
  const isPro = scans > 30;
  const pct = (scans / 100) * 100;
  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "56px auto 0",
        borderRadius: "26px",
        padding: "1.5px",
        // Borda foil animada (o card escuro por cima deixa só o fio visível)
        background: FOIL,
        backgroundSize: "200% 200%",
        animation: "mfFoilShift 7s linear infinite",
        boxShadow: "0 24px 64px rgba(2,6,23,0.35)",
      }}
    >
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: keyframe estático do shimmer foil */}
      <style dangerouslySetInnerHTML={{ __html: FOIL_CSS }} />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: CSS estático do thumb do slider */}
      <style dangerouslySetInnerHTML={{ __html: RANGE_THUMB_CSS }} />
      <div
        style={{
          borderRadius: "24.5px",
          background: "#020617",
          padding: isMobile ? "32px 24px" : "48px 56px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr",
          gap: isMobile ? "32px" : "40px",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Brilho interno sutil */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-120px",
            left: "-80px",
            width: "420px",
            height: "320px",
            background:
              "radial-gradient(ellipse at center, rgba(248,86,167,0.16) 0%, transparent 70%)",
            filter: "blur(30px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "3px",
              background: FOIL,
              backgroundSize: "200% 200%",
              animation: "mfFoilShift 7s linear infinite",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            MINT FOIL PRO
          </span>
          <h3
            style={{
              fontSize: "clamp(26px, 4vw, 38px)",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.8px",
              lineHeight: 1.1,
              margin: "14px 0 0",
            }}
          >
            Turbine sua coleção.
          </h3>
          <p
            style={{
              fontSize: "14.5px",
              lineHeight: "22px",
              color: "rgba(255,255,255,0.6)",
              margin: "12px 0 24px",
              maxWidth: "440px",
            }}
          >
            Scans ilimitados, histórico completo de preços e os novos TCGs
            chegando primeiro pra você.
          </p>
          {/* Features em 2 colunas */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: "8px 20px",
              marginBottom: "28px",
            }}
          >
            {PRO_FEATURES.map((f) => (
              <div
                key={f}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Check size={14} color="#FF9AD5" />
                <span
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  {f}
                </span>
              </div>
            ))}
          </div>

          {/* Slider de scans/dia — o preço ao lado do botão responde */}
          <div style={{ maxWidth: "440px", marginBottom: "26px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "10px",
              }}
            >
              <span
                style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.55)" }}
              >
                Quantos scans você faz por dia?
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {scans >= 100 ? "100+" : scans}
              </span>
            </div>
            <input
              type="range"
              className="mf-range"
              min={0}
              max={100}
              step={1}
              value={scans}
              onChange={(e) => setScans(Number(e.target.value))}
              aria-label="Quantos scans você faz por dia"
              style={{
                width: "100%",
                height: "8px",
                borderRadius: "4px",
                background: `linear-gradient(to right, #FF9AD5 0%, #F856A7 ${pct}%, rgba(255,255,255,0.14) ${pct}%, rgba(255,255,255,0.14) 100%)`,
                cursor: "pointer",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => {
                // Grátis → scan direto (30/dia sem conta); PRO → login
                window.location.href = isPro ? "/login" : "/scan";
              }}
              style={{
                padding: "13px 30px",
                borderRadius: "999px",
                border: "none",
                background: FOIL,
                backgroundSize: "200% 200%",
                animation: "mfFoilShift 7s linear infinite",
                color: "#020617",
                fontWeight: 800,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 6px 22px rgba(248,86,167,0.35)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 30px rgba(248,86,167,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 6px 22px rgba(248,86,167,0.35)";
              }}
            >
              {isPro ? "Assinar PRO" : "Começar grátis"}
            </button>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>
              <strong style={{ color: "#FFFFFF", fontSize: "16px" }}>
                {isPro ? "R$ 19,90" : "R$ 0"}
              </strong>
              /mês{isPro && " · cancele quando quiser"}
            </span>
          </div>

          {/* Volume de loja foge do slider: canal direto */}
          <p
            style={{
              fontSize: "12.5px",
              color: "rgba(255,255,255,0.45)",
              margin: "18px 0 0",
            }}
          >
            Lojista ou coleção grande?{" "}
            <a
              href="mailto:contato@mintfoil.app?subject=Plano%20para%20lojas"
              style={{
                color: "#F856A7",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Fale com a gente →
            </a>
          </p>
        </div>

        {/* Wordmark PRO em foil */}
        {!isMobile && (
          <div style={{ textAlign: "center", position: "relative" }}>
            <span
              aria-hidden
              style={{
                fontSize: "clamp(90px, 11vw, 150px)",
                fontWeight: 900,
                letterSpacing: "-0.05em",
                lineHeight: 1,
                background: FOIL,
                backgroundSize: "200% 200%",
                animation: "mfFoilShift 7s linear infinite",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                userSelect: "none",
              }}
            >
              PRO
            </span>
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: "-14px",
                right: "8%",
                fontSize: "22px",
                color: "#FFF3A0",
              }}
            >
              ✦
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Calculadora de plano: até 30 scans/dia = Grátis; acima = PRO 19,90 ────────

const RANGE_THUMB_CSS = `
.mf-range { -webkit-appearance: none; appearance: none; outline: none; }
.mf-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 26px; height: 26px; background: #FFFFFF; border: 2px solid #F856A7; border-radius: 50%; cursor: pointer; box-shadow: 0 2px 8px rgba(248,86,167,0.35); }
.mf-range::-moz-range-thumb { width: 24px; height: 24px; background: #FFFFFF; border: 2px solid #F856A7; border-radius: 50%; cursor: pointer; box-shadow: 0 2px 8px rgba(248,86,167,0.35); }
`;

// Corpo separado pra ler o tema DE DENTRO do AltSection: no dark a seção
// inverte pro fundo branco, e ler o tema de fora pintava texto branco no
// branco (ilegível)
function Pricing() {
  return (
    // Fundo branco também no light (como a Coleções) — o AltSection já
    // pintava branco no dark; o override iguala os dois
    <AltSection id="planos" style={{ background: "#FFFFFF" }}>
      <PricingInner />
    </AltSection>
  );
}

function PricingInner() {
  const t = useTheme();
  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* Cabeçalho: label texto (sem tag) + título, centralizado */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <FadeIn>
          <p
            style={{
              fontSize: "18px",
              lineHeight: "20px",
              fontWeight: 500,
              // Rosa do light fixo (a seção é branca também no dark)
              color: "#F856A7",
              letterSpacing: "0.5px",
              margin: "0 0 12px",
            }}
          >
            Planos
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2
            style={{
              fontSize: "clamp(24px, 4vw, 34px)",
              lineHeight: "clamp(32px, 5.5vw, 44px)",
              fontWeight: 700,
              color: t.text,
              margin: "0 auto",
              maxWidth: "640px",
            }}
          >
            Grátis pra começar. PRO quando quiser.
          </h2>
        </FadeIn>
        <FadeIn delay={0.18}>
          <p
            style={{
              fontSize: "clamp(15px, 2.5vw, 18px)",
              lineHeight: "28px",
              color: t.muted,
              maxWidth: "520px",
              margin: "14px auto 0",
            }}
          >
            Menos de R$ 0,66/dia. Menos que um booster pack.
          </p>
        </FadeIn>
      </div>
      {/* Momento "dourado" da página, em versão foil — com o slider de
          scans embutido: o preço responde ao uso */}
      <FadeIn delay={0.15}>
        <ProBanner />
      </FadeIn>
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
          <strong style={{ color: t.primary }}>UMA</strong> carta que vale mais
          do que pensava.
        </p>
      </FadeIn>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

const SOCIAL_LINKS: {
  id: string;
  icon: ReactNode;
  label: string;
  href?: string;
}[] = [
  {
    id: "instagram",
    icon: <Instagram size={15} />,
    label: "Instagram",
    href: "https://instagram.com/mintfoil",
  },
  { id: "youtube", icon: <Youtube size={15} />, label: "YouTube" },
  { id: "twitter", icon: <Twitter size={15} />, label: "X / Twitter" },
];

function FooterSection() {
  const isMobile = useIsMobile();
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
        padding: "120px 24px 28px",
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
            marginBottom: "26px",
          }}
        >
          Pronto pra começar?
        </h2>

        {/* Download badges */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <StoreBadge store="ios" light />
          <StoreBadge store="android" light />
        </div>

        {/* Explorar Agora — abaixo das lojas */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 0,
          }}
        >
          <PrimaryBtn
            dark
            onClick={() => {
              window.location.href = "/explore";
            }}
          >
            <ArrowRight size={16} /> Explorar Agora
          </PrimaryBtn>
        </div>
      </div>

      {/* Bottom bar — grid 1fr/auto/1fr: copyright na esquerda, sociais
          EXATAMENTE no meio, links + voltar-ao-topo na direita */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "grid",
          // Mobile: empilha centralizado; desktop: esq/centro/dir
          gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr",
          justifyItems: isMobile ? "center" : undefined,
          alignItems: "center",
          gap: isMobile ? "16px" : "12px",
          maxWidth: "1200px",
          margin: "56px auto 0",
          paddingTop: "24px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Left: copyright */}
        <p
          style={{
            justifySelf: "start",
            fontSize: "11px",
            color: "rgba(255,255,255,0.3)",
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          © 2026 Mint Foil · São Paulo, Brasil
        </p>

        {/* Sociais — centro */}
        <div style={{ display: "flex", gap: "14px", justifySelf: "center" }}>
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.id}
              href={s.href ?? "#"}
              target={s.href ? "_blank" : undefined}
              rel={s.href ? "noreferrer" : undefined}
              aria-label={s.label}
              style={{
                width: "32px",
                height: "32px",
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
            </a>
          ))}
        </div>

        {/* Right: nav links + voltar ao topo */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            alignItems: "center",
            justifySelf: "end",
          }}
        >
          {[
            { lbl: "Privacidade", href: "/privacidade" },
            { lbl: "Termos", href: "/termos" },
            { lbl: "Suporte", href: "mailto:contato@mintfoil.app" },
            { lbl: "Loja", href: "/loja" },
          ].map(({ lbl, href }) => (
            <a
              key={lbl}
              href={href}
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
                cursor: "pointer",
                transition: "color 0.2s",
                padding: 0,
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.3)";
              }}
            >
              {lbl}
            </a>
          ))}

          {/* Voltar ao topo — junto dos links, na direita */}
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
      </div>
    </footer>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

// View Transitions: sem crossfade default — o círculo do toggle é a única
// animação (revela o tema novo real, sem tela chapada)
const VT_CSS =
  "::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }";

// Grava o tema em cookie (SSR do próximo load) + localStorage (compat)
function persistTheme(dark: boolean) {
  const v = dark ? "dark" : "light";
  localStorage.setItem("mf-theme", v);
  // biome-ignore lint/suspicious/noDocumentCookie: cookie simples de preferência de tema, lido no SSR
  document.cookie = `mf-theme=${v}; path=/; max-age=31536000; SameSite=Lax`;
}

export function LandingPage({
  initialDark = false,
}: {
  initialDark?: boolean;
}) {
  const [isDark, setIsDark] = useState(initialDark);
  const theme = isDark ? DARK : LIGHT;

  // No load: escolha salva do usuário > tema do sistema. Lido pós-mount
  // (não no estado inicial) pra não divergir do SSR na hidratação;
  // useLayoutEffect: o flip acontece ANTES do paint pós-hidratação
  useLayoutEffect(() => {
    const stored = localStorage.getItem("mf-theme");
    const desired =
      stored === "dark" || stored === "light"
        ? stored === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
    // Converge cookie/localStorage (1ª visita ou cookie apagado); só
    // re-renderiza se o SSR veio com o tema errado
    persistTheme(desired);
    setIsDark((cur) => (cur === desired ? cur : desired));
  }, []);

  // Landing SEMPRE abre do topo — inclusive quando o navegador tenta
  // restaurar a posição (voltar/bfcache)
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.scrollTo(0, 0);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  // Mantém as vars pré-paint em sincronia com o tema do React
  useLayoutEffect(() => {
    const r = document.documentElement;
    const bg = isDark ? "#020617" : "#FFFFFF";
    r.style.setProperty("--mf-bg", bg);
    r.style.setProperty("--mf-fg", isDark ? "#FFFFFF" : "#020617");
    r.style.setProperty("--mf-wash", isDark ? "0" : "1");
    r.style.setProperty("--mf-primary", isDark ? "#B50D57" : "#F856A7");
    r.style.setProperty(
      "--mf-body",
      isDark ? "rgba(255,255,255,0.82)" : "#4a4a68",
    );
    r.style.setProperty(
      "--mf-ghost-bg",
      isDark ? "rgba(2,6,23,0.3)" : "rgba(255,255,255,0.35)",
    );
    r.style.setProperty(
      "--mf-primary-bg",
      isDark ? "rgba(181,13,87,0.07)" : "rgba(248,86,167,0.07)",
    );
    r.style.setProperty(
      "--mf-primary-border",
      isDark ? "rgba(181,13,87,0.22)" : "rgba(248,86,167,0.2)",
    );
    // html/body pintados junto (o body tem bg claro vindo do globals.css)
    r.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;
  }, [isDark]);

  const handleThemeToggle = (
    btnRef: React.RefObject<HTMLButtonElement | null>,
  ) => {
    const apply = () => {
      setIsDark((d) => {
        persistTheme(!d);
        return !d;
      });
    };

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };
    if (!doc.startViewTransition) {
      const style = document.createElement("style");
      style.innerHTML =
        "*, *::before, *::after { transition: background-color 0.45s ease, color 0.45s ease, border-color 0.45s ease, fill 0.45s ease !important; }";
      document.head.appendChild(style);
      apply();
      setTimeout(() => style.remove(), 600);
      return;
    }

    const rect = btnRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : 40;
    const maxR = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const vt = doc.startViewTransition(() => {
      flushSync(apply);
    });
    vt.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxR}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 550,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <ThemeCtx.Provider value={theme}>
      <div
        style={{
          // var resolvida ANTES do paint pelo script do layout — sem flash
          background: "var(--mf-bg, #FFFFFF)",
          color: theme.text,
          minHeight: "100vh",
          // "clip" evita scroll horizontal SEM quebrar position:sticky
          overflowX: "clip",
          transition: "background 0.1s",
        }}
      >
        {/* Desliga o crossfade padrão do View Transitions: só o círculo anima */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: CSS estático do view-transition */}
        <style dangerouslySetInnerHTML={{ __html: VT_CSS }} />
        <Nav isDark={isDark} onToggle={handleThemeToggle} />
        <Hero />
        {/* Margem negativa: a "Veja em ação" já espera atrás da animação,
            que dá fade no final — sem tela vazia entre as duas */}
        {/* z-index alto: a animação pinta por cima da seção de vídeo que
            espera atrás; quando o fade final vira visibility:hidden, o vídeo
            aparece. Sem isso o vídeo cobria o fim da animação. */}
        <div
          style={{
            position: "relative",
            zIndex: 30,
            marginBottom: "-100vh",
          }}
        >
          <CinematicHero
            isDark={isDark}
            storeBadges={
              <>
                <StoreBadge store="ios" brand />
                <StoreBadge store="android" brand />
              </>
            }
          />
        </div>
        {/* Narrativa: demo (vídeo) → leveza (Coleções) → dor (Tesouro) →
            resposta (Solução) → prova (Como funciona) → por que nós
            (Diferenciais) → preço. Coleções entre o vídeo e o Tesouro é a
            ponte de ritmo: calmo → lúdico → emocional */}
        <VideoSection />
        <ScrollMorphSection isDark={isDark} />
        <SolutionSection />
        <KeyFeatures />
        <RevealSection />
        <WhyMintFoil />
        <Pricing />
        <FooterSection />
      </div>
    </ThemeCtx.Provider>
  );
}
