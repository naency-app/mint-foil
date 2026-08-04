import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ProfileHeader } from "@/app/components/ProfileHeader";
import { ViewerBanner } from "./viewer-banner";
import { ShowcaseBrowser } from "./showcase-browser";
import type { Showcase } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mintfoil.com";

// Aceita o handle com ou sem "@" na URL (/showcase/profile/@joao).
function cleanHandle(raw: string): string {
  return decodeURIComponent(raw).replace(/^@+/, "").toLowerCase();
}

/**
 * `cache()` deduplica dentro de UM request: `generateMetadata` e a página
 * chamam isto com o mesmo handle e o backend é consultado uma vez só — antes
 * eram duas viagens idênticas para renderizar um perfil.
 *
 * Continua `no-store`: o perfil precisa refletir na hora quando o dono
 * adiciona cartas. A dedupe é por request, não cache entre requests.
 */
const fetchShowcase = cache(
  async (handle: string): Promise<Showcase | null> => {
    try {
      const res = await fetch(
        `${API_URL}/users/showcase/${encodeURIComponent(handle)}`,
        { cache: "no-store" },
      );
      if (!res.ok) return null;
      return (await res.json()) as Showcase;
    } catch {
      return null;
    }
  },
);

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const data = await fetchShowcase(cleanHandle(handle));
  if (!data) {
    return { title: "Perfil não encontrado • Mint Foil" };
  }
  const title = `${data.displayName} (@${data.handle}) • Mint Foil`;
  const description = `${data.totalCards} cartas • R$ ${formatPrice(
    data.totalValue,
  )} na coleção de ${data.displayName} no Mint Foil.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: data.image ? [{ url: data.image }] : undefined,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function ShowcaseProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const data = await fetchShowcase(cleanHandle(handle));
  if (!data) notFound();

  const shareUrl = `${SITE_URL}/showcase/profile/@${data.handle}`;
  const hasCards = data.portfolios.some((p) => p.items.length > 0);

  return (
    <>
      {/* Cabeçalho compartilhado (capa + card) — visão pública/share */}
      <ProfileHeader
        displayName={data.displayName}
        handle={data.handle}
        image={data.image}
        isPro={data.isPro}
        memberSince={data.memberSince}
        totalCards={data.totalCards}
        totalSealed={data.totalSealed}
        totalValue={data.totalValue}
        cover={data.cover}
        actions={<ViewerBanner handle={data.handle} shareUrl={shareUrl} />}
      />

      {/* Navegador de coleção (busca, portfólio, sort, view, filtros) */}
      <main className="mx-auto max-w-7xl space-y-6 px-4 pb-8 sm:px-6">
        {hasCards ? (
          <ShowcaseBrowser portfolios={data.portfolios} />
        ) : (
          <div className="glass-card !rounded-2xl p-12 text-center">
            <p className="text-sm font-semibold text-foreground">
              Esta coleção ainda não tem cartas.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Quando {data.displayName} adicionar cartas, elas aparecem aqui.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
