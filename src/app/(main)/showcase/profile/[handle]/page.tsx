import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Crown, Layers, Package, TrendingUp } from "lucide-react";
import { ViewerBanner } from "./viewer-banner";
import { ShowcaseBrowser } from "./showcase-browser";
import type { Showcase } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mintfoil.com";

// Aceita o handle com ou sem "@" na URL (/showcase/profile/@joao).
function cleanHandle(raw: string): string {
  return decodeURIComponent(raw).replace(/^@+/, "").toLowerCase();
}

async function fetchShowcase(handle: string): Promise<Showcase | null> {
  try {
    // Sem cache: o perfil precisa refletir na hora quando o dono adiciona cartas.
    const res = await fetch(
      `${API_URL}/users/showcase/${encodeURIComponent(handle)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return (await res.json()) as Showcase;
  } catch {
    return null;
  }
}

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatMonthYear(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
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

function StatTile({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="glass-card !rounded-xl p-4 flex flex-col gap-1">
      <span className="text-tertiary">{icon}</span>
      <span className="text-xl font-black text-foreground font-mono">{value}</span>
      <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

export default async function ShowcaseProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const data = await fetchShowcase(cleanHandle(handle));
  if (!data) notFound();

  const initial = data.displayName.charAt(0).toUpperCase();
  const shareUrl = `${SITE_URL}/showcase/profile/@${data.handle}`;
  const hasCards = data.portfolios.some((p) => p.items.length > 0);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Faixa "seu perfil público" — só para o dono (client, viewer-aware) */}
      <ViewerBanner handle={data.handle} shareUrl={shareUrl} />

      {/* Header do perfil */}
      <header className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="size-24 rounded-full overflow-hidden bg-primary/15 flex items-center justify-center shrink-0">
          {data.image ? (
            <Image
              src={data.image}
              alt={data.displayName}
              width={96}
              height={96}
              className="size-24 object-cover"
            />
          ) : (
            <span className="text-4xl font-black text-primary">{initial}</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black text-foreground">
              {data.displayName}
            </h1>
            {data.isPro && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                <Crown className="size-3" />
                PRO
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            @{data.handle}
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Membro desde {formatMonthYear(data.memberSince)}
          </p>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3">
        <StatTile
          icon={<Layers className="size-4" />}
          value={String(data.totalCards)}
          label="Cartas"
        />
        <StatTile
          icon={<Package className="size-4" />}
          value={String(data.totalSealed)}
          label="Selados"
        />
        <StatTile
          icon={<TrendingUp className="size-4" />}
          value={`R$ ${formatPrice(data.totalValue)}`}
          label="Valor"
        />
      </section>

      {/* Navegador de coleção (busca, portfólio, sort, view, filtros) */}
      {hasCards ? (
        <ShowcaseBrowser portfolios={data.portfolios} />
      ) : (
        <div className="glass-card !rounded-2xl p-12 text-center space-y-1">
          <p className="text-sm font-semibold text-foreground">
            Esta coleção ainda não tem cartas.
          </p>
          <p className="text-xs text-muted-foreground">
            Quando {data.displayName} adicionar cartas, elas aparecem aqui.
          </p>
        </div>
      )}
    </main>
  );
}
