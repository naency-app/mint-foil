"use client";

import SpotlightCards, {
  type SpotlightItem,
} from "@/components/kokonutui/spotlight-cards";
import { api, type Tcg } from "@/lib/api";
import { useEffect, useState } from "react";

const TCG_CONFIG: Record<string, { color: string; image: string }> = {
  pokemon: { color: "#f59e0b", image: "/logos/pokemon.webp" },
  magic: { color: "#e05c2a", image: "/logos/magic.webp" },
  yugioh: { color: "#7c3aed", image: "/logos/yugioh.webp" },
  onepiece: { color: "#0ea5e9", image: "/logos/one-piece.webp" },
};

function toSpotlightItem(tcg: Tcg): SpotlightItem {
  const config = TCG_CONFIG[tcg.slug] ?? { color: "#6b7280", image: "" };
  return {
    image: config.image || undefined,
    title: tcg.name,
    description: `${tcg._count?.cards ?? 0} cartas catalogadas`,
    color: config.color,
    href: `/sets/${tcg.slug}`,
  };
}

export default function SetsPage() {
  const [tcgs, setTcgs] = useState<Tcg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.cards
      .tcgs()
      .then(setTcgs)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sets</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Escolha um TCG para explorar seus sets e expansões.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card h-40 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <SpotlightCards
          items={tcgs.map(toSpotlightItem)}
          className="dark:bg-transparent p-0"
        />
      )}
    </main>
  );
}
