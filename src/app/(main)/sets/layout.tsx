import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Coleções de TCG — preço das cartas em real | Mint Foil" },
  description:
    "Coleções de Pokémon, Magic, Yu-Gi-Oh!, One Piece, Lorcana, Digimon e Dragon Ball com o preço de cada carta em real.",
  alternates: { canonical: "/sets" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
