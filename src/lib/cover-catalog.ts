/**
 * Catálogo de fundos do perfil — espelho de `lib/cover-catalog.ts` do app.
 *
 * O banco guarda só o slug (`coverType: 'preset'`, `coverValue: 'aurora'`);
 * quem sabe desenhar o fundo é o cliente. Os dois projetos são independentes
 * (não há pacote compartilhado), então esta lista precisa ser mantida em par
 * com a do app: um slug que só existe lá aparece aqui como gradiente padrão.
 *
 * Nunca reaproveite um id para outro visual: perfis salvos apontam para ele.
 */
export type CoverTier = "free" | "pro";

interface Ponto {
  x: number;
  y: number;
}

/**
 * Brilho radial por cima da base, na geometria do `radial-gradient(rx% ry% at
 * cx% cy%)`: centro e raios em % da capa, então pode nascer fora dela.
 */
export interface CoverGlow {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** Do centro para a borda; a última parada costuma ter opacidade 0. */
  stops: { offset: number; color: string; opacity: number }[];
}

export interface CoverPreset {
  id: string;
  name: string;
  tier: CoverTier;
  /**
   * Paradas do degradê. Num fundo com `base`, é a lista de cores representativas
   * (base + brilhos) — é ela que o véu do `ProfileCover` usa.
   */
  colors: string[];
  locations?: number[];
  /** Direção do degradê. Sem isto, de cima para baixo. */
  start?: Ponto;
  end?: Ponto;
  /** Cor chapada no lugar do degradê — para fundos feitos só de brilhos. */
  base?: string;
  glows?: CoverGlow[];
}

function brilho(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
  opacity: number,
  apagaEm: number,
): CoverGlow {
  return {
    cx,
    cy,
    rx,
    ry,
    stops: [
      { offset: 0, color, opacity },
      { offset: apagaEm, color, opacity: 0 },
    ],
  };
}

export const COVER_PRESETS: CoverPreset[] = [
  // ─── Grátis ───────────────────────────────────────────────
  {
    id: "meia-noite",
    name: "Meia-noite",
    tier: "free",
    colors: ["#475569", "#020617"],
  },
  {
    id: "floresta",
    name: "Floresta",
    tier: "free",
    colors: ["#059669", "#022c22"],
  },
  { id: "vinho", name: "Vinho", tier: "free", colors: ["#dc2626", "#450a0a"] },
  {
    id: "ametista",
    name: "Ametista",
    tier: "free",
    colors: ["#7c3aed", "#2e1065"],
  },
  {
    id: "oceano",
    name: "Oceano",
    tier: "free",
    colors: ["#0284c7", "#082f49"],
  },
  { id: "brasa", name: "Brasa", tier: "free", colors: ["#ea580c", "#431407"] },

  // ─── Pro ──────────────────────────────────────────────────
  // Cada um com família de cor e forma próprias (ver o comentário no app).
  {
    id: "aurora",
    name: "Aurora",
    tier: "pro",
    colors: ["#0c1b24", "#3fbf9a", "#6d5bd0"],
    base: "#0c1b24",
    glows: [
      brilho(15, 10, 120, 90, "#3fbf9a", 0.6, 0.6),
      brilho(90, 35, 90, 80, "#6d5bd0", 0.45, 0.65),
    ],
  },
  {
    id: "poente",
    name: "Poente",
    tier: "pro",
    colors: ["#e89a74", "#a9566b", "#3b2440"],
    locations: [0, 0.55, 1],
  },
  {
    id: "neon",
    name: "Neon",
    tier: "pro",
    colors: ["#0e0f1a", "#e04ea8", "#38c6d9"],
    base: "#0e0f1a",
    glows: [
      brilho(100, 100, 70, 130, "#e04ea8", 0.8, 0.6),
      brilho(0, 0, 45, 80, "#38c6d9", 0.5, 0.6),
    ],
  },
  {
    id: "esmeralda",
    name: "Esmeralda",
    tier: "pro",
    colors: ["#1f7a5c", "#0f3d33", "#0b2320", "#c9a44c"],
    locations: [0, 0.6, 1, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    glows: [brilho(88, 10, 55, 90, "#c9a44c", 0.4, 0.6)],
  },
  {
    id: "magma",
    name: "Magma",
    tier: "pro",
    colors: ["#1c1412", "#d9502a", "#f2b544"],
    base: "#1c1412",
    glows: [
      {
        cx: 50,
        cy: 118,
        rx: 80,
        ry: 120,
        stops: [
          { offset: 0, color: "#f2b544", opacity: 1 },
          { offset: 0.32, color: "#d9502a", opacity: 1 },
          { offset: 0.72, color: "#d9502a", opacity: 0 },
        ],
      },
    ],
  },
  {
    id: "nebulosa",
    name: "Nebulosa",
    tier: "pro",
    colors: ["#15132b", "#c86aa8", "#5a7bd8"],
    base: "#15132b",
    glows: [
      brilho(25, 72, 60, 95, "#c86aa8", 0.6, 0.65),
      brilho(80, 22, 60, 95, "#5a7bd8", 0.55, 0.65),
    ],
  },
];

export function findCoverPreset(
  id: string | null | undefined,
): CoverPreset | null {
  if (!id) return null;
  return COVER_PRESETS.find((p) => p.id === id) ?? null;
}

function rgba(hex: string, alpha: number): string {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * O `background` CSS de um fundo: brilhos por cima, base (ou degradê) por baixo.
 * Mesma composição que o app desenha com LinearGradient + SVG.
 */
export function coverCss(preset: CoverPreset): string {
  const camadas = (preset.glows ?? []).map((g) => {
    const paradas = g.stops
      .map((st) => `${rgba(st.color, st.opacity)} ${Math.round(st.offset * 100)}%`)
      .join(", ");
    return `radial-gradient(${g.rx}% ${g.ry}% at ${g.cx}% ${g.cy}%, ${paradas})`;
  });

  if (preset.base) {
    camadas.push(`linear-gradient(${preset.base}, ${preset.base})`);
  } else {
    const inicio = preset.start ?? { x: 0.5, y: 0 };
    const fim = preset.end ?? { x: 0.5, y: 1 };
    const graus =
      (Math.atan2(fim.x - inicio.x, -(fim.y - inicio.y)) * 180) / Math.PI;
    const paradas = preset.colors
      .map((c, i) =>
        preset.locations?.[i] !== undefined
          ? `${c} ${Math.round(preset.locations[i] * 100)}%`
          : c,
      )
      .join(", ");
    camadas.push(`linear-gradient(${Math.round(graus)}deg, ${paradas})`);
  }

  return camadas.join(", ");
}
