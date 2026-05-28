"use client";

import {
  ArrowLeft,
  Package,
  ShoppingBag,
  ShoppingCart,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// ── Design tokens ────────────────────────────────────────────────────────────

const T = {
  bg: "#FFFFFF",
  bgAlt: "#F6F6F6",
  primary: "#B50D57",
  text: "#020617",
  textBody: "#4a4a68",
  muted: "rgba(0,0,0,0.45)",
  border: "rgba(0,0,0,0.08)",
  primaryBorder: "rgba(181,13,87,0.2)",
  primaryBg: "rgba(181,13,87,0.07)",
};

const font = `"Circular Std", "DM Sans", system-ui, sans-serif`;

// ── Product data ─────────────────────────────────────────────────────────────

type Category = "Todos" | "Sleeves" | "Deck Boxes" | "Playmat" | "Vestuário";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Exclude<Category, "Todos">;
  badge?: string;
  stars: number;
  reviews: number;
};

const PRODUCTS: Product[] = [
  {
    id: "sleeve-pink-100",
    name: "Sleeves Mint Foil Pink",
    description:
      "100 sleeves premium tamanho padrão. Material PET de alta resistência.",
    price: 39.9,
    originalPrice: 49.9,
    category: "Sleeves",
    badge: "Mais vendido",
    stars: 5,
    reviews: 128,
  },
  {
    id: "sleeve-dark-100",
    name: "Sleeves Mint Foil Dark",
    description:
      "100 sleeves premium tamanho padrão. Acabamento matte premium.",
    price: 39.9,
    category: "Sleeves",
    stars: 4.8,
    reviews: 74,
  },
  {
    id: "sleeve-clear-100",
    name: "Sleeves Transparentes Ultra Clear",
    description: "100 sleeves cristal para exibição de cartas. Anti-reflexo.",
    price: 29.9,
    category: "Sleeves",
    stars: 4.6,
    reviews: 53,
  },
  {
    id: "deckbox-pink",
    name: "Deck Box Pink Gradient",
    description: "Comporta até 100 cartas com sleeves. Trava magnética.",
    price: 59.9,
    originalPrice: 79.9,
    category: "Deck Boxes",
    badge: "Novo",
    stars: 4.9,
    reviews: 41,
  },
  {
    id: "deckbox-dark",
    name: "Deck Box Midnight Dark",
    description:
      "Comporta até 100 cartas com sleeves. Material premium rigídeo.",
    price: 59.9,
    category: "Deck Boxes",
    stars: 4.7,
    reviews: 29,
  },
  {
    id: "playmat-logo",
    name: "Playmat Mint Foil Logo",
    description: "60×35cm, base antiderrapante. Tecido de alta qualidade.",
    price: 89.9,
    originalPrice: 109.9,
    category: "Playmat",
    badge: "Popular",
    stars: 5,
    reviews: 62,
  },
  {
    id: "playmat-art",
    name: "Playmat Sakura Edition",
    description: "Arte exclusiva edição limitada. 60×35cm.",
    price: 99.9,
    category: "Playmat",
    badge: "Edição limitada",
    stars: 4.9,
    reviews: 18,
  },
  {
    id: "tshirt-pink",
    name: "Camiseta Mint Foil Pink",
    description: "100% algodão penteado. Logo bordado. Tamanhos P ao XGG.",
    price: 69.9,
    category: "Vestuário",
    stars: 4.8,
    reviews: 35,
  },
  {
    id: "tshirt-dark",
    name: "Camiseta Mint Foil Dark",
    description: "100% algodão penteado. Estampa frontal. Tamanhos P ao XGG.",
    price: 69.9,
    category: "Vestuário",
    stars: 4.7,
    reviews: 22,
  },
];

const CATEGORIES: Category[] = [
  "Todos",
  "Sleeves",
  "Deck Boxes",
  "Playmat",
  "Vestuário",
];

// ── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ stars }: { stars: number }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          fill={n <= Math.round(stars) ? T.primary : "transparent"}
          color={n <= Math.round(stars) ? T.primary : T.muted}
        />
      ))}
    </span>
  );
}

function ProductPlaceholder({ category }: { category: string }) {
  const icons: Record<string, React.ReactNode> = {
    Sleeves: <Package size={40} color={T.primary} strokeWidth={1.5} />,
    "Deck Boxes": <ShoppingBag size={40} color={T.primary} strokeWidth={1.5} />,
    Playmat: (
      <div
        style={{
          width: 64,
          height: 40,
          borderRadius: 6,
          background: `linear-gradient(135deg, ${T.primary}33 0%, ${T.primary}88 100%)`,
          border: `1px solid ${T.primaryBorder}`,
        }}
      />
    ),
    Vestuário: <ShoppingCart size={40} color={T.primary} strokeWidth={1.5} />,
  };

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "4/3",
        background: T.bgAlt,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        border: `1px solid ${T.border}`,
      }}
    >
      {icons[category] ?? (
        <Package size={40} color={T.primary} strokeWidth={1.5} />
      )}
      <span style={{ fontSize: 11, color: T.muted, fontFamily: font }}>
        Foto em breve
      </span>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  function handleBuy() {
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: decorative shadow on hover
    <div
      style={{
        background: T.bg,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: font,
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 8px 32px rgba(181,13,87,0.10)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Image area */}
      <div style={{ position: "relative", padding: "16px 16px 0" }}>
        <ProductPlaceholder category={product.category} />
        {product.badge && (
          <span
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              background: T.primary,
              color: "#FFFFFF",
              fontSize: 11,
              fontWeight: 600,
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
              top: 24,
              right: 24,
              background: "#16a34a",
              color: "#FFFFFF",
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 20,
            }}
          >
            -{discount}%
          </span>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          padding: "16px 16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <StarRating stars={product.stars} />
          <span style={{ fontSize: 12, color: T.muted }}>
            ({product.reviews})
          </span>
        </div>

        <h3
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: T.text,
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {product.name}
        </h3>

        <p
          style={{
            fontSize: 13,
            color: T.textBody,
            margin: 0,
            lineHeight: 1.5,
            flex: 1,
          }}
        >
          {product.description}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginTop: 4,
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 700, color: T.text }}>
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
          {product.originalPrice && (
            <span
              style={{
                fontSize: 13,
                color: T.muted,
                textDecoration: "line-through",
              }}
            >
              R$ {product.originalPrice.toFixed(2).replace(".", ",")}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleBuy}
          style={{
            marginTop: 8,
            padding: "10px 0",
            borderRadius: 10,
            border: "none",
            background: added ? "#16a34a" : T.primary,
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "opacity 0.2s, background 0.3s",
            fontFamily: font,
            width: "100%",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "1";
          }}
        >
          {added ? "Adicionado!" : "Comprar"}
        </button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LojaPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("Todos");

  const filtered =
    activeCategory === "Todos"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: font }}>
      {/* ── Nav ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${T.border}`,
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: T.textBody,
            textDecoration: "none",
            fontSize: 14,
            fontFamily: font,
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
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: T.text,
              fontFamily: font,
            }}
          >
            Mint Foil <span style={{ color: T.primary }}>Loja</span>
          </span>
        </div>

        <div style={{ width: 70 }} />
      </nav>

      {/* ── Hero banner ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${T.primaryBg} 0%, ${T.bgAlt} 100%)`,
          borderBottom: `1px solid ${T.border}`,
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: T.primaryBg,
            border: `1px solid ${T.primaryBorder}`,
            color: T.primary,
            fontSize: 12,
            fontWeight: 600,
            padding: "4px 14px",
            borderRadius: 20,
            marginBottom: 16,
            fontFamily: font,
          }}
        >
          Merch Oficial
        </span>
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 44px)",
            fontWeight: 800,
            color: T.text,
            margin: "0 0 12px",
            fontFamily: font,
          }}
        >
          Mostre que você é <span style={{ color: T.primary }}>TCG</span>
        </h1>
        <p
          style={{
            fontSize: 16,
            color: T.textBody,
            maxWidth: 520,
            margin: "0 auto",
            lineHeight: 1.6,
            fontFamily: font,
          }}
        >
          Acessórios premium para colecionadores, lojistas e jogadores.
          Qualidade que combina com suas cartas.
        </p>
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "40px 24px 80px",
        }}
      >
        {/* Category filters */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 36,
          }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 24,
                  border: isActive ? "none" : `1px solid ${T.border}`,
                  background: isActive ? T.primary : T.bg,
                  color: isActive ? "#FFFFFF" : T.textBody,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.18s",
                  fontFamily: font,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p
          style={{
            fontSize: 14,
            color: T.muted,
            marginBottom: 24,
            fontFamily: font,
          }}
        >
          {filtered.length} produto{filtered.length !== 1 ? "s" : ""}
          {activeCategory !== "Todos" ? ` em ${activeCategory}` : ""}
        </p>

        {/* Products grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 24,
          }}
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Coming soon banner */}
        <div
          style={{
            marginTop: 64,
            padding: "36px 32px",
            background: T.bgAlt,
            border: `1px dashed ${T.primaryBorder}`,
            borderRadius: 16,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: T.primary,
              fontWeight: 600,
              marginBottom: 8,
              fontFamily: font,
            }}
          >
            Em breve
          </p>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: T.text,
              margin: "0 0 10px",
              fontFamily: font,
            }}
          >
            Mais produtos chegando
          </h3>
          <p
            style={{
              fontSize: 14,
              color: T.textBody,
              maxWidth: 400,
              margin: "0 auto",
              lineHeight: 1.6,
              fontFamily: font,
            }}
          >
            Binders, portfolios, card cases e muito mais. Cadastre-se no app
            para ser avisado primeiro.
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          borderTop: `1px solid ${T.border}`,
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 13,
            color: T.muted,
            fontFamily: font,
          }}
        >
          © 2025 Mint Foil · Todos os direitos reservados ·{" "}
          <Link href="/" style={{ color: T.primary, textDecoration: "none" }}>
            Voltar para o site
          </Link>
        </p>
      </div>
    </div>
  );
}
