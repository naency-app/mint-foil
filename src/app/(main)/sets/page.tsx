"use client";

import { TCG_CATALOG } from "@/lib/tcg-catalog";
import Link from "next/link";

export default function SetsPage() {
  return (
    <main className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Coleções / Sets</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Escolha um TCG para explorar seus sets, expansões e acompanhar o progresso de sua coleção.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {TCG_CATALOG.map((item) => {
          if (!item.supported) {
            return (
              <div
                key={item.categoryId}
                className="group relative aspect-[1.5] w-full rounded-2xl border border-border overflow-hidden bg-card opacity-45 select-none"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover grayscale"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent flex flex-col justify-end p-4">
                  <span className="text-sm sm:text-base font-bold text-white leading-tight">
                    {item.name}
                  </span>
                  <span className="absolute bottom-4 right-4 bg-muted border border-border/80 px-2 py-0.5 rounded text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    Em breve
                  </span>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.categoryId}
              href={`/sets/${item.slug}`}
              className="group relative aspect-[1.5] w-full rounded-2xl border border-border hover:border-slate-400 dark:hover:border-slate-700 overflow-hidden bg-card hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-300 block"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end items-start p-4 text-left">
                <span className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
