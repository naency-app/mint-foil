import type { Metadata } from "next";
import { LandingPage } from "@/app/components/LandingPage";

export const metadata: Metadata = {
  title: "Mint Foil — Escaneie, Colete e Domine o Mercado TCG",
  description:
    "Identifique cartas com IA, acompanhe preços do mercado brasileiro em tempo real e gerencie todo o seu portfólio de TCG em um só lugar. Pokémon, Magic, Yu-Gi-Oh!, One Piece e mais.",
};

export default function Page() {
  return <LandingPage />;
}
