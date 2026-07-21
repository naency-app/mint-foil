"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TCG_CATALOG } from "@/lib/tcg-catalog";

export default function SetsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Coleções / Sets</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha um TCG para explorar seus sets, expansões e acompanhar o
          progresso de sua coleção.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {TCG_CATALOG.map((item) => {
          if (!item.supported) {
            return (
              <div
                key={item.categoryId}
                className="glass-card group relative aspect-[1.5] w-full select-none overflow-hidden !rounded-2xl opacity-45"
              >
                {/* biome-ignore lint/performance/noImgElement: artes locais dos TCGs, sem otimização necessária */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover grayscale"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-end justify-end p-3">
                  <Badge
                    variant="outline"
                    className="h-4 bg-background/80 px-1.5 font-mono text-[9px] uppercase leading-none tracking-wider backdrop-blur-sm"
                  >
                    Breve
                  </Badge>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.categoryId}
              href={`/sets/${item.slug}`}
              className="glass-card group relative block aspect-[1.5] w-full overflow-hidden !rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10"
            >
              {/* biome-ignore lint/performance/noImgElement: artes locais dos TCGs, sem otimização necessária */}
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
                loading="lazy"
              />
            </Link>
          );
        })}
      </div>
    </main>
  );
}
