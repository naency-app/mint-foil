"use client";

import {
  ArrowLeft,
  Minus,
  Moon,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Star,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";

// ── Design tokens — mesmos da landing ────────────────────────────────────────

const LIGHT = {
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

const DARK = {
  bg: "#020617",
  bgAlt: "#070D1C",
  primary: "#B50D57",
  text: "#FFFFFF",
  textBody: "rgba(255,255,255,0.82)",
  muted: "rgba(255,255,255,0.48)",
  border: "rgba(255,255,255,0.1)",
  primaryBorder: "rgba(248,86,167,0.25)",
  primaryBg: "rgba(248,86,167,0.1)",
  cardBg: "rgba(255,255,255,0.03)",
  isDark: true,
};

const GRAD = "linear-gradient(135deg, #F856A7 0%, #B50D57 100%)";
// Foil rosa/roxo/azul do wordmark (mesmo da landing)
const FOIL_PINK =
  "linear-gradient(110deg, #B50D57 0%, #D7327F 6%, #F856A7 12%, #FC7DC0 19%, #FF9AD5 26%, #E3A9E9 33%, #C49AFF 40%, #AEADFF 45%, #9AC1FF 50%, #AEADFF 55%, #C49AFF 60%, #E3A9E9 67%, #FF9AD5 74%, #FC7DC0 81%, #F856A7 88%, #D7327F 94%, #B50D57 100%)";
const LOJA_CSS = `
@keyframes mfFoilShift { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
@keyframes mfSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes mfFadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

const SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif';

// ── Catálogo — personalizados com artes dos TCGs ─────────────────────────────

type Category = "Todos" | "Camisetas" | "Canecas" | "Playmats" | "Acessórios";

// Cores dos jogos (mesmas dos monogramas da landing)
const TCG_COLORS: Record<string, string> = {
  pokemon: "#FFCB05",
  yugioh: "#EF4444",
  magic: "#A855F7",
  onepiece: "#F97316",
  mintfoil: "#F856A7",
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Exclude<Category, "Todos">;
  tcg: keyof typeof TCG_COLORS;
  badge?: string;
  stars: number;
  reviews: number;
};

const PRODUCTS: Product[] = [
  {
    id: "tshirt-kanto",
    name: "Camiseta Iniciais de Kanto",
    description:
      "Arte exclusiva dos três iniciais. 100% algodão penteado, P ao XGG.",
    price: 79.9,
    originalPrice: 99.9,
    category: "Camisetas",
    tcg: "pokemon",
    badge: "Mais vendido",
    stars: 5,
    reviews: 96,
  },
  {
    id: "tshirt-dragao-branco",
    name: "Camiseta Dragão Branco",
    description:
      "Estampa inspirada no dragão lendário de olhos azuis. P ao XGG.",
    price: 79.9,
    category: "Camisetas",
    tcg: "yugioh",
    stars: 4.9,
    reviews: 54,
  },
  {
    id: "tshirt-planeswalker",
    name: "Camiseta Planeswalker",
    description: "Os cinco mana em arte minimalista. 100% algodão, P ao XGG.",
    price: 74.9,
    category: "Camisetas",
    tcg: "magic",
    stars: 4.7,
    reviews: 38,
  },
  {
    id: "tshirt-gear5",
    name: "Camiseta Sol Nascente",
    description:
      "Arte inspirada no despertar lendário. Edição pirata, P ao XGG.",
    price: 79.9,
    category: "Camisetas",
    tcg: "onepiece",
    badge: "Novo",
    stars: 4.8,
    reviews: 21,
  },
  {
    id: "caneca-foil-eletrico",
    name: "Caneca Foil Elétrica",
    description:
      "325ml com arte holográfica que muda com a luz. O rato elétrico como você nunca viu.",
    price: 49.9,
    category: "Canecas",
    tcg: "pokemon",
    badge: "Novo",
    stars: 4.9,
    reviews: 43,
  },
  {
    id: "caneca-grimorio",
    name: "Caneca Grimório",
    description: "325ml estilo livro de feitiços, com os símbolos de mana.",
    price: 44.9,
    category: "Canecas",
    tcg: "magic",
    stars: 4.6,
    reviews: 27,
  },
  {
    id: "caneca-milenio",
    name: "Caneca Milênio",
    description: "325ml com o olho dourado do milênio em relevo.",
    price: 49.9,
    category: "Canecas",
    tcg: "yugioh",
    stars: 4.8,
    reviews: 19,
  },
  {
    id: "playmat-sakura",
    name: "Playmat Sakura Duel",
    description:
      "60×35cm, base antiderrapante, arte exclusiva Mint Foil. Edição limitada.",
    price: 99.9,
    originalPrice: 119.9,
    category: "Playmats",
    tcg: "mintfoil",
    badge: "Edição limitada",
    stars: 5,
    reviews: 34,
  },
  {
    id: "playmat-grand-line",
    name: "Playmat Grand Line",
    description: "60×35cm com o mapa da rota de todos os piratas.",
    price: 89.9,
    category: "Playmats",
    tcg: "onepiece",
    stars: 4.7,
    reviews: 16,
  },
  {
    id: "sleeves-pink",
    name: "Sleeves Mint Foil Pink",
    description: "100 sleeves premium padrão. PET de alta resistência.",
    price: 39.9,
    originalPrice: 49.9,
    category: "Acessórios",
    tcg: "mintfoil",
    stars: 5,
    reviews: 128,
  },
  {
    id: "deckbox-midnight",
    name: "Deck Box Midnight",
    description: "Até 100 cartas com sleeves. Trava magnética, toque premium.",
    price: 59.9,
    category: "Acessórios",
    tcg: "mintfoil",
    stars: 4.7,
    reviews: 29,
  },
];

const CATEGORIES: Category[] = [
  "Todos",
  "Camisetas",
  "Canecas",
  "Playmats",
  "Acessórios",
];

type Theme = typeof LIGHT;

const brl = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

// ── Sub-componentes ──────────────────────────────────────────────────────────

function StarRating({ stars, t }: { stars: number; t: Theme }) {
  const accent = t.isDark ? "#F856A7" : t.primary;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={11}
          fill={n <= Math.round(stars) ? accent : "transparent"}
          color={n <= Math.round(stars) ? accent : t.muted}
        />
      ))}
    </span>
  );
}

// Placeholder de foto: quadrado, glow na cor do jogo (padrão da landing)
function ProductArt({
  product,
  t,
  size = "lg",
}: {
  product: Product;
  t: Theme;
  size?: "lg" | "sm";
}) {
  const color = TCG_COLORS[product.tcg];
  const sm = size === "sm";
  return (
    <div
      style={{
        width: sm ? 64 : "100%",
        aspectRatio: "1/1",
        flexShrink: 0,
        background: t.isDark ? "rgba(255,255,255,0.02)" : t.bgAlt,
        borderRadius: sm ? 10 : 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        border: sm ? `1px solid ${t.border}` : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 115%, ${color}30 0%, transparent 62%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          width: sm ? 30 : 58,
          height: sm ? 30 : 58,
          borderRadius: sm ? 8 : 16,
          background: `${color}1F`,
          border: `1px solid ${color}45`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ShoppingBag size={sm ? 15 : 26} color={color} strokeWidth={1.7} />
      </div>
      {!sm && (
        <span style={{ fontSize: 11, color: t.muted }}>Foto em breve</span>
      )}
    </div>
  );
}

function ProductCard({
  product,
  t,
  onAdd,
}: {
  product: Product;
  t: Theme;
  onAdd: (id: string) => void;
}) {
  const accent = t.isDark ? "#F856A7" : t.primary;

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover decorativo na borda
    <div
      style={{
        background: t.cardBg,
        border: `1px solid ${t.border}`,
        borderRadius: 18,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.3s ease, transform 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${accent}55`;
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = t.border;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Imagem full-bleed no topo */}
      <div style={{ position: "relative" }}>
        <ProductArt product={product} t={t} />
        {product.badge && (
          <span
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: GRAD,
              color: "#FFFFFF",
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 20,
            }}
          >
            {product.badge}
          </span>
        )}
        {discount && (
          <span
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "#16a34a",
              color: "#FFFFFF",
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 20,
            }}
          >
            -{discount}%
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div
        style={{
          padding: "14px 16px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 7,
          flex: 1,
          borderTop: `1px solid ${t.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <StarRating stars={product.stars} t={t} />
          <span style={{ fontSize: 11.5, color: t.muted }}>
            ({product.reviews})
          </span>
        </div>

        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: t.text,
            margin: 0,
            lineHeight: 1.3,
            letterSpacing: "-0.2px",
          }}
        >
          {product.name}
        </h3>

        <p
          style={{
            fontSize: 12.5,
            color: t.muted,
            margin: 0,
            lineHeight: 1.5,
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.description}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginTop: 2,
          }}
        >
          <span style={{ fontSize: 19, fontWeight: 800, color: t.text }}>
            {brl(product.price)}
          </span>
          {product.originalPrice && (
            <span
              style={{
                fontSize: 12.5,
                color: t.muted,
                textDecoration: "line-through",
              }}
            >
              {brl(product.originalPrice)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onAdd(product.id)}
          style={{
            marginTop: 8,
            padding: "11px 0",
            borderRadius: 999,
            border: "none",
            background: GRAD,
            color: "#FFFFFF",
            fontSize: 13.5,
            fontWeight: 700,
            cursor: "pointer",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            width: "100%",
            boxShadow: "0 4px 14px rgba(248,86,167,0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 8px 22px rgba(248,86,167,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(248,86,167,0.3)";
          }}
        >
          Adicionar ao carrinho
        </button>
      </div>
    </div>
  );
}

// ── Drawer do carrinho ───────────────────────────────────────────────────────

function CartDrawer({
  t,
  items,
  onClose,
  onChangeQty,
  onRemove,
}: {
  t: Theme;
  items: { product: Product; qty: number }[];
  onClose: () => void;
  onChangeQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}) {
  const accent = t.isDark ? "#F856A7" : t.primary;
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);

  return (
    <>
      {/* Backdrop */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop fecha o drawer */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: botão X cobre teclado */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(2,6,23,0.5)",
          backdropFilter: "blur(3px)",
          zIndex: 90,
          animation: "mfFadeIn 0.25s ease",
        }}
      />
      {/* Painel */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(400px, 100vw)",
          background: t.isDark ? "#070D1C" : "#FFFFFF",
          borderLeft: `1px solid ${t.border}`,
          zIndex: 91,
          display: "flex",
          flexDirection: "column",
          animation: "mfSlideIn 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
          boxShadow: "-24px 0 64px rgba(2,6,23,0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 800, color: t.text }}>
            Seu carrinho{" "}
            <span style={{ color: t.muted, fontWeight: 600 }}>
              ({items.reduce((s, i) => s + i.qty, 0)})
            </span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar carrinho"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: t.muted,
              display: "flex",
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Itens */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {items.length === 0 ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                color: t.muted,
              }}
            >
              <ShoppingCart size={36} strokeWidth={1.4} />
              <p style={{ fontSize: 14, margin: 0 }}>Seu carrinho está vazio</p>
            </div>
          ) : (
            items.map(({ product, qty }) => (
              <div
                key={product.id}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: `1px solid ${t.border}`,
                }}
              >
                <ProductArt product={product} t={t} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: t.text,
                      margin: "0 0 2px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {product.name}
                  </p>
                  <p style={{ fontSize: 13, color: accent, fontWeight: 700 }}>
                    {brl(product.price)}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 8,
                    }}
                  >
                    {/* Qty stepper */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        border: `1px solid ${t.border}`,
                        borderRadius: 999,
                        padding: "4px 10px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onChangeQty(product.id, -1)}
                        aria-label="Diminuir quantidade"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: t.text,
                          display: "flex",
                          padding: 0,
                        }}
                      >
                        <Minus size={13} />
                      </button>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: t.text,
                          minWidth: 14,
                          textAlign: "center",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => onChangeQty(product.id, 1)}
                        aria-label="Aumentar quantidade"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: t.text,
                          display: "flex",
                          padding: 0,
                        }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(product.id)}
                      aria-label="Remover item"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: t.muted,
                        display: "flex",
                        padding: 4,
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            style={{
              padding: "16px 20px 20px",
              borderTop: `1px solid ${t.border}`,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span style={{ fontSize: 14, color: t.muted }}>Subtotal</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: t.text }}>
                {brl(subtotal)}
              </span>
            </div>
            <p style={{ fontSize: 12, color: t.muted, margin: 0 }}>
              Frete e prazos calculados no checkout.
            </p>
            <button
              type="button"
              style={{
                padding: "13px 0",
                borderRadius: 999,
                border: "none",
                background: GRAD,
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                width: "100%",
                boxShadow: "0 6px 20px rgba(248,86,167,0.35)",
              }}
            >
              Finalizar pedido
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: t.muted,
                fontSize: 13,
                fontWeight: 600,
                padding: 0,
              }}
            >
              Continuar comprando
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

// ── Página ───────────────────────────────────────────────────────────────────

// Grava o tema em cookie (SSR do próximo load) + localStorage (compat)
function persistTheme(dark: boolean) {
  const v = dark ? "dark" : "light";
  localStorage.setItem("mf-theme", v);
  // biome-ignore lint/suspicious/noDocumentCookie: cookie simples de preferência de tema, lido no SSR
  document.cookie = `mf-theme=${v}; path=/; max-age=31536000; SameSite=Lax`;
}

export function LojaClient({ initialDark = false }: { initialDark?: boolean }) {
  const [activeCategory, setActiveCategory] = useState<Category>("Todos");
  const [isDark, setIsDark] = useState(initialDark);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = isDark ? DARK : LIGHT;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Mesmo esquema da landing: escolha salva > tema do sistema; layoutEffect
  // pra flipar antes do paint pós-hidratação
  useLayoutEffect(() => {
    const stored = localStorage.getItem("mf-theme");
    const desired =
      stored === "dark" || stored === "light"
        ? stored === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
    persistTheme(desired);
    setIsDark((cur) => (cur === desired ? cur : desired));
  }, []);

  // Troca gradual (morphing), como na landing
  const toggleTheme = () => {
    const style = document.createElement("style");
    style.innerHTML =
      "*, *::before, *::after { transition: background-color 0.45s ease, color 0.45s ease, border-color 0.45s ease, fill 0.45s ease !important; }";
    document.head.appendChild(style);
    setIsDark((d) => {
      persistTheme(!d);
      return !d;
    });
    setTimeout(() => style.remove(), 600);
  };

  const addToCart = (id: string) => {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
    setCartOpen(true);
  };
  const changeQty = (id: string, delta: number) => {
    setCart((c) => {
      const next = (c[id] ?? 0) + delta;
      if (next <= 0) {
        const { [id]: _gone, ...rest } = c;
        return rest;
      }
      return { ...c, [id]: next };
    });
  };
  const removeItem = (id: string) => changeQty(id, -Infinity);

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({
      product: PRODUCTS.find((p) => p.id === id),
      qty,
    }))
    .filter((i): i is { product: Product; qty: number } => !!i.product);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const filtered =
    activeCategory === "Todos"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  const accent = t.isDark ? "#F856A7" : t.primary;

  // Mantém as vars pré-paint em sincronia com o tema
  useLayoutEffect(() => {
    const r = document.documentElement;
    const bg = isDark ? "#020617" : "#FFFFFF";
    r.style.setProperty("--mf-bg", bg);
    r.style.setProperty("--mf-fg", isDark ? "#FFFFFF" : "#020617");
    r.style.setProperty("--mf-wash", isDark ? "0" : "1");
    // html/body pintados junto (o body tem bg claro vindo do globals.css)
    r.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;
  }, [isDark]);

  return (
    <div
      style={{
        minHeight: "100vh",
        // var resolvida antes do paint (script do layout) — sem flash
        background: "var(--mf-bg, #FFFFFF)",
        color: t.text,
      }}
    >
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: keyframes estáticos */}
      <style dangerouslySetInnerHTML={{ __html: LOJA_CSS }} />

      {/* ── Nav — encolhe pra pill no scroll, igual à landing ── */}
      <nav
        style={{
          position: "fixed",
          top: scrolled ? "12px" : "0px",
          left: "50%",
          transform: "translateX(-50%)",
          width: scrolled ? "min(880px, calc(100% - 32px))" : "100%",
          zIndex: 50,
          background: scrolled
            ? "rgba(var(--mf-nav-rgb, 255,255,255), 0.6)"
            : "rgba(var(--mf-nav-rgb, 255,255,255), 0.85)",
          backdropFilter: "blur(16px) saturate(1.4)",
          WebkitBackdropFilter: "blur(16px) saturate(1.4)",
          border: scrolled ? `1px solid ${t.border}` : "1px solid transparent",
          borderBottom: `1px solid ${t.border}`,
          borderRadius: scrolled ? "16px" : "0px",
          boxShadow: scrolled
            ? t.isDark
              ? "0 8px 28px rgba(0,0,0,0.35)"
              : "0 8px 28px rgba(2,6,23,0.08)"
            : "none",
          padding: scrolled ? "0 14px" : "0 20px",
          height: scrolled ? 52 : 60,
          display: "flex",
          alignItems: "center",
          gap: 12,
          transition:
            "top 0.35s ease, width 0.35s ease, height 0.35s ease, padding 0.35s ease, background 0.35s ease, border-radius 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: t.muted,
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {/* biome-ignore lint/performance/noImgElement: logo local pequeno */}
          <img src="/landing/logo-m.png" alt="" width={24} height={24} />
          <span
            style={{
              fontFamily: SYSTEM_FONT,
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--mf-nav-fg, #020617)",
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
            </span>{" "}
            <span style={{ color: "var(--mf-primary, #F856A7)" }}>Loja</span>
          </span>
        </div>

        {/* Carrinho */}
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          aria-label="Abrir carrinho"
          style={{
            position: "relative",
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: t.primaryBg,
            border: `1px solid ${t.primaryBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: accent,
          }}
        >
          <ShoppingCart size={15} />
          {cartCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                minWidth: 17,
                height: 17,
                borderRadius: 9,
                background: GRAD,
                color: "#FFFFFF",
                fontSize: 10,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                border: `2px solid ${t.bg}`,
              }}
            >
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </button>

        {/* Toggle de tema */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Alternar tema"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: t.primaryBg,
            border: `1px solid ${t.primaryBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: accent,
          }}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </nav>

      {/* Espaçador da nav fixa */}
      <div style={{ height: 60 }} />

      {/* ── Hero ── */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderBottom: `1px solid ${t.border}`,
          padding: "64px 24px",
          textAlign: "center",
          // var pré-paint no light: evita frame branco no reload em dark
          background: t.isDark ? t.bgAlt : "var(--mf-bg, #FFFFFF)",
        }}
      >
        {/* Luz ambiente descendo do topo (só no light, como na landing) */}
        {!t.isDark && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(1200px, 140vw)",
              height: "100%",
              background:
                "radial-gradient(ellipse 55% 70% at 50% 0%, rgba(248,86,167,0.18) 0%, rgba(248,86,167,0.06) 45%, transparent 72%)",
              filter: "blur(50px)",
              pointerEvents: "none",
              opacity: "var(--mf-wash, 1)",
            }}
          />
        )}
        <div style={{ position: "relative" }}>
          <span
            style={{
              display: "inline-block",
              background: "var(--mf-primary-bg, rgba(248,86,167,0.07))",
              border:
                "1px solid var(--mf-primary-border, rgba(248,86,167,0.2))",
              color: "var(--mf-primary, #F856A7)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              padding: "4px 14px",
              borderRadius: 20,
              marginBottom: 18,
            }}
          >
            Personalizados
          </span>
          <h1
            style={{
              fontSize: "clamp(30px, 5.5vw, 52px)",
              fontWeight: 800,
              letterSpacing: "-1px",
              color: "var(--mf-fg, #020617)",
              margin: "0 0 12px",
              lineHeight: 1.08,
            }}
          >
            Vista o seu{" "}
            <span style={{ color: "var(--mf-primary, #F856A7)" }}>
              jogo favorito.
            </span>
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "var(--mf-body, #4a4a68)",
              maxWidth: 560,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Camisetas, canecas e playmats com artes inspiradas nos TCGs que você
            coleciona — criados por quem também joga.
          </p>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "40px 24px 80px",
        }}
      >
        {/* Filtros + contagem na mesma linha */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 28,
          }}
        >
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => {
              const isActive = cat === activeCategory;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 999,
                    border: isActive ? "none" : `1px solid ${t.border}`,
                    background: isActive ? GRAD : "transparent",
                    color: isActive ? "#FFFFFF" : t.textBody,
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.18s",
                    boxShadow: isActive
                      ? "0 4px 14px rgba(248,86,167,0.3)"
                      : "none",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 13, color: t.muted, margin: 0 }}>
            {filtered.length} produto{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Grid de produtos */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 20,
          }}
        >
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              t={t}
              onAdd={addToCart}
            />
          ))}
        </div>

        {/* Em breve */}
        <div
          style={{
            marginTop: 64,
            padding: "36px 32px",
            background: t.isDark ? "rgba(255,255,255,0.02)" : t.bgAlt,
            border: `1px dashed ${t.primaryBorder}`,
            borderRadius: 16,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: accent,
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Em breve
          </p>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: t.text,
              margin: "0 0 10px",
            }}
          >
            Mais artes chegando
          </h3>
          <p
            style={{
              fontSize: 14,
              color: t.muted,
              maxWidth: 420,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Binders, chaveiros, quadros e novas coleções de artes. Baixe o app e
            seja avisado primeiro.
          </p>
        </div>
      </div>

      {/* ── Rodapé ── */}
      <div
        style={{
          borderTop: `1px solid ${t.border}`,
          padding: 24,
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 13, color: t.muted }}>
          © 2026 Mint Foil · Todos os direitos reservados ·{" "}
          <Link href="/" style={{ color: accent, textDecoration: "none" }}>
            Voltar para o site
          </Link>
        </p>
      </div>

      {/* ── Carrinho lateral ── */}
      {cartOpen && (
        <CartDrawer
          t={t}
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onChangeQty={changeQty}
          onRemove={removeItem}
        />
      )}
    </div>
  );
}
