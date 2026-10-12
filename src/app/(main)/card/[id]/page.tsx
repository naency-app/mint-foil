import type { Metadata } from "next";
import { precoAtual } from "@/lib/reference-price";
import { buscarCarta } from "@/lib/servidor";
import { cardName, cardNameEn } from "@/lib/utils";
import { CardDetailClient } from "./card-client";

/**
 * Tela da carta. O servidor busca a carta para duas coisas: o título, a
 * descrição e a prévia da página (Google, WhatsApp) e o conteúdo inicial, que
 * já sai no HTML. O resto (portfólio, gráfico interativo) é o card-client.
 */

type Props = { params: Promise<{ id: string }> };

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const carta = await buscarCarta(id);
  if (!carta) return { title: "Carta | Mint Foil" };

  const nome = cardName(carta);
  const nomeEn = cardNameEn(carta);
  const numero = carta.collectorNumber ?? null;
  const jogo = carta.tcg?.name ?? null;
  const colecao = carta.set?.name ?? carta.setName ?? null;
  const preco = precoAtual(carta.prices);

  // "Bloqueador de Magia (Magic Jammer) MRD-EN128 · Yu-Gi-Oh! — preço"
  const titulo = [
    nomeEn ? `${nome} (${nomeEn})` : nome,
    numero,
    jogo ? `· ${jogo}` : null,
    "— preço",
  ]
    .filter(Boolean)
    .join(" ");

  const descricao = [
    preco > 0
      ? `Quanto vale ${nome}${numero ? ` (${numero})` : ""}: ${brl(preco)} hoje.`
      : `${nome}${numero ? ` (${numero})` : ""}: preço em real.`,
    colecao ? `Coleção ${colecao}.` : null,
    carta.rarity ? `Raridade ${carta.rarity}.` : null,
    "Histórico de preço e onde comprar no Brasil, no Mint Foil.",
  ]
    .filter(Boolean)
    .join(" ");

  // Foto só da própria carta; sem foto, a prévia fica sem imagem
  const foto =
    carta.hasImage === false
      ? null
      : (carta.images?.full ?? carta.imageUrl ?? null);

  return {
    title: { absolute: `${titulo} | Mint Foil` },
    description: descricao,
    alternates: { canonical: `/card/${carta.id}` },
    openGraph: {
      title: titulo,
      description: descricao,
      url: `/card/${carta.id}`,
      siteName: "Mint Foil",
      locale: "pt_BR",
      type: "website",
      ...(foto ? { images: [{ url: foto, alt: nome }] } : {}),
    },
    twitter: {
      card: foto ? "summary_large_image" : "summary",
      title: titulo,
      description: descricao,
      ...(foto ? { images: [foto] } : {}),
    },
  };
}

export default async function CardDetailPage({ params }: Props) {
  const { id } = await params;
  const carta = await buscarCarta(id);
  return <CardDetailClient id={id} inicial={carta} />;
}
