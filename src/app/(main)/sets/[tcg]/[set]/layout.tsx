import type { Metadata } from "next";
import { buscarColecao } from "@/lib/servidor";
import { TCG_CATALOG } from "@/lib/tcg-catalog";

/**
 * Só o título, a descrição e a prévia da coleção para o Google e o WhatsApp:
 * a página em si é client e lê os params pelo useParams.
 */
type Props = {
  params: Promise<{ tcg: string; set: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({
  params,
}: Omit<Props, "children">): Promise<Metadata> {
  const { tcg, set } = await params;
  const colecao = await buscarColecao(tcg, set);
  const jogo = TCG_CATALOG.find((t) => t.slug === tcg)?.name;
  if (!colecao) return { title: { absolute: "Coleção | Mint Foil" } };

  const titulo = `${colecao.name}${jogo ? ` · ${jogo}` : ""} — preço das cartas`;
  const total = colecao._count?.cards ?? colecao.totalCards;
  const descricao = [
    `Todas as cartas de ${colecao.name}${jogo ? ` (${jogo})` : ""} com preço em real`,
    total ? `${total} cartas,` : null,
    "raridades e histórico de preço no Mint Foil.",
  ]
    .filter(Boolean)
    .join(" ");
  const capa = colecao.imageUrl ?? colecao.coverFallbackUrl ?? null;

  return {
    title: { absolute: `${titulo} | Mint Foil` },
    description: descricao,
    alternates: { canonical: `/sets/${tcg}/${set}` },
    openGraph: {
      title: titulo,
      description: descricao,
      url: `/sets/${tcg}/${set}`,
      siteName: "Mint Foil",
      locale: "pt_BR",
      type: "website",
      ...(capa ? { images: [{ url: capa, alt: colecao.name }] } : {}),
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
