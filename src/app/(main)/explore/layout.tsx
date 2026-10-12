import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Explorar cartas de TCG — preço em real | Mint Foil",
  },
  description:
    "Busque qualquer carta de Pokémon, Magic, Yu-Gi-Oh!, One Piece, Lorcana e Digimon, inclusive pelo nome em português, e veja quanto vale em real.",
  alternates: { canonical: "/explore" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
