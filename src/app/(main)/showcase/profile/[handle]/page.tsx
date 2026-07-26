import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Crown } from "lucide-react";
import { ViewerBanner } from "./viewer-banner";
import { ShowcaseBrowser } from "./showcase-browser";
import { ProfileCover } from "./profile-cover";
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
    <>
      {/* Capa full-bleed (config. no futuro: cor/imagem/gif) + card do perfil */}
      <ProfileCover cover={data.cover}>
        {/* Ações do dono (compartilhar) — sobrepostas no canto da capa */}
        <div className="absolute right-4 top-4 z-10 sm:right-6">
          <ViewerBanner handle={data.handle} shareUrl={shareUrl} />
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="glass-card flex flex-col items-center !rounded-2xl p-6 text-center">
            <div className="-mt-16 mb-3 flex size-24 items-center justify-center overflow-hidden rounded-full bg-primary/15 ring-4 ring-background">
              {data.image ? (
                <Image
                  src={data.image}
                  alt={data.displayName}
                  width={96}
                  height={96}
                  className="size-24 object-cover"
                />
              ) : (
                <span className="text-4xl font-black text-primary">
                  {initial}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-foreground">
                {data.displayName}
              </h1>
              {data.isPro && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
                  <Crown className="size-3" />
                  PRO
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              @{data.handle}
            </p>

            <p className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground">
              Valor estimado do portfólio
            </p>
            <p className="font-mono text-3xl font-black text-foreground">
              R$ {formatPrice(data.totalValue)}
            </p>

            <div className="mt-4 flex items-stretch divide-x divide-border">
              <div className="px-6">
                <p className="font-mono text-lg font-black text-foreground">
                  {data.totalCards}
                </p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Cartas
                </p>
              </div>
              <div className="px-6">
                <p className="font-mono text-lg font-black text-foreground">
                  {data.totalSealed}
                </p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Selados
                </p>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-muted-foreground/70">
              Membro desde {formatMonthYear(data.memberSince)}
            </p>
          </div>
        </div>
      </ProfileCover>

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
