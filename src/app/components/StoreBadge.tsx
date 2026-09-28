"use client";

import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/app-links";

// Selo App Store / Google Play no estilo oficial. Saiu de dentro da landing
// para ser usado também no /download — e virou link: na landing era um
// <button> sem destino, o clique não fazia nada.
export function StoreBadge({
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
    <a
      href={isIos ? APP_STORE_URL : PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={isIos ? "Baixar na App Store" : "Baixar no Google Play"}
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
        textDecoration: "none",
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
        // Google Play (Tabler outline) — o path antigo renderizava quebrado
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={fg}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 3.71v16.58a.7 .7 0 0 0 1.05 .606l14.622 -8.42a.55 .55 0 0 0 0 -.953l-14.622 -8.419a.7 .7 0 0 0 -1.05 .607l0 -.001" />
          <path d="M15 9l-10.5 11.5" />
          <path d="M4.5 3.5l10.5 11.5" />
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
    </a>
  );
}
