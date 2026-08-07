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

export interface CoverPreset {
  id: string;
  name: string;
  tier: CoverTier;
  /** Do topo para a base. */
  colors: string[];
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
  {
    id: "aurora",
    name: "Aurora",
    tier: "pro",
    colors: ["#7c3aed", "#2563eb", "#0d9488"],
  },
  {
    id: "poente",
    name: "Poente",
    tier: "pro",
    colors: ["#f59e0b", "#db2777", "#4c1d95"],
  },
  {
    id: "neon",
    name: "Neon",
    tier: "pro",
    colors: ["#a855f7", "#6366f1", "#0f172a"],
  },
  {
    id: "esmeralda",
    name: "Esmeralda",
    tier: "pro",
    colors: ["#34d399", "#0891b2", "#0f172a"],
  },
  {
    id: "magma",
    name: "Magma",
    tier: "pro",
    colors: ["#fbbf24", "#dc2626", "#1c1917"],
  },
  {
    id: "nebulosa",
    name: "Nebulosa",
    tier: "pro",
    colors: ["#f472b6", "#7c3aed", "#1e1b4b"],
  },
];

export function findCoverPreset(
  id: string | null | undefined,
): CoverPreset | null {
  if (!id) return null;
  return COVER_PRESETS.find((p) => p.id === id) ?? null;
}
