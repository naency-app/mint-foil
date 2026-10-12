import type { Metadata } from "next";
import { TCG_CATALOG } from "@/lib/tcg-catalog";

/** Título e descrição das coleções de um jogo (a página é client). */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tcg: string }>;
}): Promise<Metadata> {
  const { tcg } = await params;
  const jogo = TCG_CATALOG.find((t) => t.slug === tcg)?.name;
  if (!jogo) return { title: { absolute: "Coleções | Mint Foil" } };
  const titulo = `Coleções de ${jogo} — preço das cartas em real`;
  const descricao = `Todas as coleções de ${jogo}, da mais nova à mais antiga, com o preço de cada carta em real no Mint Foil.`;
  return {
    title: { absolute: `${titulo} | Mint Foil` },
    description: descricao,
    alternates: { canonical: `/sets/${tcg}` },
    openGraph: { title: titulo, description: descricao, url: `/sets/${tcg}` },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
