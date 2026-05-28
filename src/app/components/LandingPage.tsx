"use client";

import gsap from "gsap";
import {
  ArrowRight,
  BarChart3,
  Camera,
  Check,
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
        width: "240px",
        padding: "10px",
        borderRadius: "36px",
        background: "linear-gradient(145deg, #e8e8ef 0%, #d0d0db 100%)",
        border: `1px solid ${BORDER}`,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90px",
          height: "24px",
          borderRadius: "16px",
          background: "#c8c8d2",
          zIndex: 5,
        }}
      />
      <div
        style={{
          borderRadius: "26px",
          overflow: "hidden",
          background: WHITE,
          aspectRatio: "9/19.5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children ?? (
          <div className="flex flex-col items-center gap-2 p-5">
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
    <div style={{ textAlign: "center", marginBottom: "52px" }}>
      {badge && (
        <FadeIn>
          <PinkBadge>{badge}</PinkBadge>
        </FadeIn>
      )}
      <FadeIn delay={0.1}>
        <h2
          style={{
            fontSize: "clamp(26px, 4.5vw, 40px)",
            fontWeight: 700,
            color: DARK,
            margin: badge ? "14px 0 0" : 0,
            lineHeight: 1.15,
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
              color: MUTED,
              maxWidth: "560px",
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

function Nav() {
  const [scrolled, setScrolled] = useState(false);
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
        zIndex: 100,
        padding: "14px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled
          ? `1px solid ${BORDER}`
          : "1px solid transparent",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "7px",
            background: GRAD,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: 800,
            color: WHITE,
          }}
        >
          M
        </div>
        <span style={{ fontSize: "15px", fontWeight: 700, color: DARK }}>
          Mint Foil
        </span>
      </div>
      <GradBtn small>
        <ArrowRight size={13} /> Baixar Grátis
      </GradBtn>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: "120px",
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
            fontSize: "clamp(32px, 5.5vw, 60px)",
            fontWeight: 700,
            color: DARK,
            lineHeight: 1.08,
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
            fontSize: "clamp(15px, 2.2vw, 17px)",
            color: TEXT_BODY,
            maxWidth: "580px",
            margin: "20px auto 0",
            lineHeight: 1.7,
          }}
        >
          Escaneie suas cartas de Pokémon, Magic, Yu-Gi-Oh! e One Piece.
          Organize num portfólio. Monitore o preço real das ligas brasileiras.
          No celular ou na web.
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
  return (
    <section style={{ background: BG_ALT, padding: "80px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <STitle
          badge="Veja em ação"
          title="Conheça a interface do Mint Foil"
          sub="Navegue pela versão web e veja como funciona na prática."
        />
        <FadeIn>
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              borderRadius: "20px",
              overflow: "hidden",
              background: WHITE,
              border: `1px solid ${BORDER}`,
              aspectRatio: "16/9",
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
            fontSize: "clamp(42px, 8vw, 72px)",
            fontWeight: 800,
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
  return (
    <section
      style={{ padding: "100px 24px", maxWidth: "1100px", margin: "0 auto" }}
    >
      <STitle badge="Coleções" title="Explore seus jogos favoritos" />
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: MUTED,
            marginBottom: "12px",
          }}
        >
          Coleções Mintfoil
        </p>
        {REVEAL_ITEMS.map(({ text, imgs }) => (
          <RevealItem key={text} text={text} imgs={imgs} />
        ))}
      </div>
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
  return (
    <section style={{ background: BG_ALT, padding: "100px 24px" }}>
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
                    fontSize: "15px",
                    fontWeight: 700,
                    color: DARK,
                    marginBottom: "6px",
                  }}
                >
                  {p.title}
                </h4>
                <p
                  style={{
                    fontSize: "13.5px",
                    color: MUTED,
                    lineHeight: 1.65,
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
  return (
    <section
      style={{ padding: "100px 24px", maxWidth: "1100px", margin: "0 auto" }}
    >
      <STitle
        badge="A Solução"
        title="3 passos. Toda a coleção sob controle."
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        {STEPS.map((s, i) => (
          <FadeIn key={s.id} delay={i * 0.12}>
            <div
              style={{
                display: "flex",
                gap: "20px",
                alignItems: "flex-start",
                padding: "24px",
                borderRadius: "14px",
                background: WHITE,
                border: `1px solid ${BORDER}`,
              }}
            >
              <div
                style={{
                  minWidth: "46px",
                  height: "46px",
                  borderRadius: "12px",
                  background: PINK_BG,
                  border: `1px solid ${PINK_BORDER}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: PINK,
                }}
              >
                {s.icon}
              </div>
              <div>
                <h4
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: DARK,
                    margin: "0 0 4px",
                  }}
                >
                  {s.title}
                </h4>
                <p
                  style={{
                    fontSize: "14px",
                    color: MUTED,
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
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
  const [activeTab, setActiveTab] = useState("colecionadores");

  return (
    <section style={{ background: BG_ALT, padding: "100px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <STitle badge="Benefícios" title="O Mint Foil se adapta a você" />
        <FadeIn>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Custom tab trigger bar */}
            <div className="flex justify-center mb-10">
              <div
                style={{
                  display: "inline-flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {BENEFIT_TABS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setActiveTab(t.value)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 22px",
                      borderRadius: "10px",
                      border: "none",
                      cursor: "pointer",
                      background:
                        activeTab === t.value ? PINK_BG : "transparent",
                      color: activeTab === t.value ? PINK : MUTED,
                      fontWeight: 600,
                      fontSize: "14px",
                      transition: "all 0.25s",
                      outline:
                        activeTab === t.value
                          ? `1px solid ${PINK_BORDER}`
                          : "1px solid transparent",
                    }}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {BENEFIT_TABS.map((t) => (
              <TabsContent key={t.value} value={t.value}>
                <AnimatePresence mode="wait">
                  {activeTab === t.value && (
                    <motion.div
                      key={t.value}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                      <div
                        style={{
                          background: WHITE,
                          border: `1px solid ${BORDER}`,
                          borderRadius: "20px",
                          padding: "clamp(28px, 5vw, 48px)",
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(280px, 1fr))",
                          gap: "40px",
                          alignItems: "center",
                          maxWidth: "900px",
                          margin: "0 auto",
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              fontSize: "clamp(22px, 3vw, 28px)",
                              fontWeight: 700,
                              color: DARK,
                              lineHeight: 1.2,
                              marginBottom: "24px",
                            }}
                          >
                            {t.title}
                          </h3>
                          {t.points.map((p) => (
                            <div
                              key={p.id}
                              style={{
                                display: "flex",
                                gap: "12px",
                                alignItems: "flex-start",
                                marginBottom: "18px",
                              }}
                            >
                              <div
                                style={{
                                  color: PINK,
                                  minWidth: "22px",
                                  marginTop: "2px",
                                }}
                              >
                                {p.icon}
                              </div>
                              <div>
                                <p
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    color: DARK,
                                    margin: "0 0 2px",
                                  }}
                                >
                                  {p.title}
                                </p>
                                <p
                                  style={{
                                    fontSize: "13px",
                                    color: MUTED,
                                    lineHeight: 1.6,
                                    margin: 0,
                                  }}
                                >
                                  {p.desc}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div
                          style={{ display: "flex", justifyContent: "center" }}
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
                              <div
                                style={{ color: PINK, marginBottom: "12px" }}
                              >
                                {t.mockupIcon}
                              </div>
                              <p style={{ fontSize: "11px", color: MUTED }}>
                                Screenshot real aqui
                              </p>
                            </div>
                          </PhoneMockup>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>
            ))}
          </Tabs>
        </FadeIn>
      </div>
    </section>
  );
}

// ── Key Features Tabs ─────────────────────────────────────────────────────────

const FEATURE_TABS = [
  {
    value: "scan",
    icon: <Zap size={15} />,
    label: "Scan Inteligente",
    badge: "IA Avançada",
    title: "Escaneie qualquer carta em segundos",
    desc: "Aponte a câmera e o Mint Foil identifica a carta. Funciona com Pokémon, Magic, Yu-Gi-Oh! e One Piece.",
    btn: "Testar Grátis",
    mockupIcon: <ScanLine size={40} />,
  },
  {
    value: "precos",
    icon: <DollarSign size={15} />,
    label: "Preços Reais BR",
    badge: "Exclusivo Brasil",
    title: "Preços das ligas brasileiras",
    desc: "Puxa preços da Liga Pokémon, myP Cards e outros marketplaces BR. O preço real.",
    btn: "Ver Preços",
    mockupIcon: <TrendingUp size={40} />,
  },
  {
    value: "portfolio",
    icon: <BarChart3 size={15} />,
    label: "Portfólio Inteligente",
    badge: "Controle Total",
    title: "Organize e decida com dados",
    desc: "Portfólio digital. Gráficos mostram quais cartas estão subindo e caindo.",
    btn: "Criar Portfólio",
    mockupIcon: <BarChart3 size={40} />,
  },
];

function KeyFeatures() {
  const [activeTab, setActiveTab] = useState("scan");

  return (
    <section
      style={{ padding: "100px 24px", maxWidth: "1100px", margin: "0 auto" }}
    >
      <STitle
        badge="Key Features"
        title="Ferramentas que nenhum outro app tem"
      />
      <FadeIn>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <div
              style={{
                display: "inline-flex",
                gap: "12px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {FEATURE_TABS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setActiveTab(f.value)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 20px",
                    borderRadius: "14px",
                    border: "none",
                    cursor: "pointer",
                    background: activeTab === f.value ? PINK_BG : "transparent",
                    color: activeTab === f.value ? PINK : MUTED,
                    fontWeight: 600,
                    fontSize: "14px",
                    transition: "all 0.25s",
                    outline:
                      activeTab === f.value
                        ? `1px solid ${PINK_BORDER}`
                        : "1px solid transparent",
                  }}
                >
                  {f.icon}
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {FEATURE_TABS.map((f) => (
            <TabsContent key={f.value} value={f.value}>
              <AnimatePresence mode="wait">
                {activeTab === f.value && (
                  <motion.div
                    key={f.value}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    <div
                      style={{
                        background: BG_ALT,
                        border: `1px solid ${BORDER}`,
                        borderRadius: "20px",
                        padding: "clamp(28px, 5vw, 48px)",
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "48px",
                        alignItems: "center",
                        maxWidth: "920px",
                        margin: "0 auto",
                      }}
                    >
                      <div>
                        <PinkBadge>{f.badge}</PinkBadge>
                        <h3
                          style={{
                            fontSize: "clamp(22px, 3vw, 30px)",
                            fontWeight: 700,
                            color: DARK,
                            lineHeight: 1.15,
                            margin: "16px 0 14px",
                          }}
                        >
                          {f.title}
                        </h3>
                        <p
                          style={{
                            fontSize: "15px",
                            color: MUTED,
                            lineHeight: 1.7,
                            margin: "0 0 24px",
                          }}
                        >
                          {f.desc}
                        </p>
                        <GradBtn>
                          <ArrowRight size={14} /> {f.btn}
                        </GradBtn>
                      </div>
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
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
                            <div style={{ color: PINK, marginBottom: "12px" }}>
                              {f.mockupIcon}
                            </div>
                            <p style={{ fontSize: "11px", color: MUTED }}>
                              Screenshot real aqui
                            </p>
                          </div>
                        </PhoneMockup>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          ))}
        </Tabs>
      </FadeIn>
    </section>
  );
}

// ── Partners ──────────────────────────────────────────────────────────────────

const PARTNER_CATS = [
  {
    id: "ligas",
    label: "Ligas & Marketplaces",
    items: [
      { id: "liga", name: "Liga Pokémon", color: "#FFCB05" },
      { id: "myp", name: "myP Cards", color: "#7C3AED" },
      { id: "mp3", name: "Marketplace 3", color: "#3B82F6" },
      { id: "mp4", name: "Marketplace 4", color: "#10B981" },
    ],
  },
  {
    id: "tcgs",
    label: "TCGs Suportados",
    items: [
      { id: "pokemon", name: "Pokémon TCG", color: "#FFCB05" },
      { id: "magic", name: "Magic: The Gathering", color: "#A855F7" },
      { id: "yugioh", name: "Yu-Gi-Oh!", color: "#EF4444" },
      { id: "onepiece", name: "One Piece TCG", color: "#F97316" },
    ],
  },
];

function Partners() {
  return (
    <section style={{ background: BG_ALT, padding: "100px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <STitle
          badge="Parceiros"
          title="Integrado com o ecossistema brasileiro"
        />
        {PARTNER_CATS.map((cat, ci) => (
          <FadeIn key={cat.id} delay={ci * 0.1}>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: MUTED,
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              {cat.label}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "36px",
              }}
            >
              {cat.items.map((p) => (
                // biome-ignore lint/a11y/noStaticElementInteractions: decorative border hover on partner pill
                <div
                  key={p.id}
                  style={{
                    padding: "12px 22px",
                    borderRadius: "10px",
                    background: WHITE,
                    border: `1px solid ${BORDER}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "border-color 0.25s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${p.color}44`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = BORDER;
                  }}
                >
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: p.color,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: TEXT_BODY,
                    }}
                  >
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>
        ))}
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
  return (
    <section
      style={{ padding: "100px 24px", maxWidth: "1100px", margin: "0 auto" }}
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
    <section style={{ background: BG_ALT, padding: "100px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <STitle badge="Objeções" title="Talvez você esteja pensando..." />
        <AccordionSection items={OBJECTION_ITEMS} />
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section
      style={{ padding: "100px 24px", maxWidth: "1100px", margin: "0 auto" }}
    >
      <STitle badge="FAQ" title="Perguntas frequentes" />
      <AccordionSection items={FAQ_ITEMS} />
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section style={{ background: BG_ALT, padding: "100px 24px" }}>
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
