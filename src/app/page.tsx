import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LandingPage } from "@/app/components/LandingPage";

export const metadata: Metadata = {
  title: "Mint Foil — Escaneie, Colete e Domine o Mercado TCG",
  description:
    "Identifique cartas com IA, acompanhe preços do mercado brasileiro em tempo real e gerencie todo o seu portfólio de TCG em um só lugar. Pokémon, Magic, Yu-Gi-Oh!, One Piece e mais.",
};

// Tema salvo em cookie: o SERVIDOR já renderiza no tema certo — reload no
// dark fica idêntico ao light (sem re-render de flip na hidratação)
export default async function Page() {
  const jar = await cookies();
  const initialDark = jar.get("mf-theme")?.value === "dark";
  return <LandingPage initialDark={initialDark} />;
}
