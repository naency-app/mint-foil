"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { api, type Tcg } from "@/lib/api";
import { Layers } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const TCG_STYLES: Record<
  string,
  { color: string; borderHover: string; fallbackEmoji: string }
> = {
  pokemon: {
    color: "from-yellow-500/20 to-yellow-600/5",
    borderHover: "hover:border-yellow-500/40",
    fallbackEmoji: "⚡",
  },
  magic: {
    color: "from-orange-500/20 to-orange-600/5",
    borderHover: "hover:border-orange-500/40",
    fallbackEmoji: "🔮",
  },
  yugioh: {
    color: "from-red-500/20 to-red-600/5",
    borderHover: "hover:border-red-500/40",
    fallbackEmoji: "🃏",
  },
  onepiece: {
    color: "from-sky-500/20 to-sky-600/5",
    borderHover: "hover:border-sky-500/40",
    fallbackEmoji: "🏴‍☠️",
  },
};

function TcgCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-6 aspect-video">
      <Skeleton className="w-full h-full rounded-lg" />
    </div>
  );
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
    <main className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sets</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Escolha um TCG para explorar seus sets e expansões.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <TcgCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tcgs.map((tcg) => {
            const style = TCG_STYLES[tcg.slug] ?? {
              color: "from-slate-500/20 to-slate-600/5",
              borderHover: "hover:border-slate-500/40",
              fallbackEmoji: "🎴",
            };

            return (
              <Link
                key={tcg.id}
                href={`/sets/${tcg.slug}`}
                className={`group relative flex flex-col items-center justify-center rounded-xl border border-border bg-card/60 backdrop-blur-sm p-8 aspect-video overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-background/50 ${style.borderHover}`}
              >
                <div
                  className={`absolute inset-0 bg-linear-to-br ${style.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />

                <div className="relative z-10 flex flex-col items-center gap-3 text-center">
                  <span className="text-4xl">{style.fallbackEmoji}</span>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {tcg.name}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tcg._count?.cards ?? 0} cartas catalogadas
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-background/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Layers className="size-3" />
                    <span>Ver sets</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
